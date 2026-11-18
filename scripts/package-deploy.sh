#!/usr/bin/env bash
#
# Builds the Hostinger deploy artifacts:
#
#   frontend-deploy.zip  the Next.js project source -> Hostinger runs the build
#   backend-deploy.zip   the prebuilt Express app   -> extract into the Node.js app dir
#
# The frontend site has a Hostinger build configuration (install + build command,
# output directory `out`), so it is shipped as source and built on the server.
# `frontend-static` instead packages a locally built out/ for serving as plain
# files, to bypass the server-side build.
#
# Usage:  scripts/package-deploy.sh [frontend|frontend-static|backend|all]
#
# Neither archive contains a .env, node_modules, tests or docs: extracting over a
# live directory leaves the server's own secrets and installed packages alone.
# See DEPLOY.md for the upload steps.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-all}"

# Baked into the frontend bundle at build time. Overridable for a staging build.
API_URL="${NEXT_PUBLIC_API_URL:-https://api.theisr.com.au}"

step() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }
fail() { printf '\033[31mFAIL: %s\033[0m\n' "$1" >&2; exit 1; }

command -v zip >/dev/null || fail "zip is not installed"

package_frontend() {
  step "Frontend: staging project source"
  cd "$ROOT/frontend"

  # Type-check locally so a broken build fails here rather than on the server,
  # where the only feedback is a deploy log.
  npx tsc --noEmit || fail "tsc failed — fix before packaging"

  local stage
  stage="$(mktemp -d)"
  trap 'rm -rf "$stage"' RETURN

  # Everything `next build` needs, and nothing else: no tests, no e2e, no
  # node_modules, no .next/out, no local env files.
  local files=(
    package.json package-lock.json
    next.config.js postcss.config.js tailwind.config.js
    tsconfig.json tsconfig.node.json components.json next-env.d.ts
    .env.production
  )
  local dirs=(app components lib public)

  for f in "${files[@]}"; do
    [ -f "$f" ] || fail "$f is missing — next build needs it"
    cp "$f" "$stage/"
  done
  for d in "${dirs[@]}"; do
    [ -d "$d" ] || fail "$d/ is missing"
    cp -R "$d" "$stage/"
  done
  find "$stage" -name '.DS_Store' -delete

  grep -q "^NEXT_PUBLIC_API_URL=$API_URL$" "$stage/.env.production" \
    || fail ".env.production does not set NEXT_PUBLIC_API_URL to $API_URL"
  # Next ranks .env.production.local and .env.local above .env.production.
  if [ -e "$stage/.env.local" ] || [ -e "$stage/.env.production.local" ]; then
    fail "a local env file reached the staging dir — it would override .env.production"
  fi
  [ -f "$stage/public/.htaccess" ] || fail "public/.htaccess missing — 404 handling would be lost"

  step "Frontend: writing frontend-deploy.zip"
  rm -f "$ROOT/frontend-deploy.zip"
  (cd "$stage" && zip -rqX "$ROOT/frontend-deploy.zip" .)
}

package_frontend_static() {
  step "Frontend (static): building export (NEXT_PUBLIC_API_URL=$API_URL)"
  cd "$ROOT/frontend"

  # Wipe out/ first: next build writes into it without pruning files left over
  # from routes that no longer exist.
  rm -rf out
  NEXT_PUBLIC_API_URL="$API_URL" npm run build

  [ -f out/index.html ]   || fail "out/index.html missing — build did not export"
  [ -f out/404.html ]     || fail "out/404.html missing — ErrorDocument would have no target"
  [ -f out/.htaccess ]    || fail "out/.htaccess missing — public/.htaccess was not copied"
  grep -q "$API_URL" out/_next/static/chunks/*.js \
    || fail "$API_URL is not baked into the bundle — check frontend/.env.local precedence"
  if find out -name '.env*' | grep -q .; then
    fail "an .env file reached out/ — it would be publicly served"
  fi

  step "Frontend (static): writing frontend-static.zip"
  rm -f "$ROOT/frontend-static.zip"
  # Archive the *contents* of out/ so it extracts straight into the web root.
  (cd out && zip -rqX "$ROOT/frontend-static.zip" . -x '.DS_Store' '**/.DS_Store')
}

package_backend() {
  step "Backend: building bundle"
  cd "$ROOT/backend"

  rm -rf dist
  npm run build    # prisma generate + esbuild index.ts -> dist/index.js
  [ -f dist/index.js ] || fail "dist/index.js missing — esbuild did not run"

  step "Backend: staging files"
  local stage
  stage="$(mktemp -d)"
  trap 'rm -rf "$stage"' RETURN

  # `dist/index.js` is prebuilt so the app can start without a server-side build.
  # The TypeScript sources ship alongside it so that a panel configured with a
  # build command can still run `npm run build` — rebuilding from sources that
  # match the bundle, rather than failing on a missing index.ts.
  mkdir -p "$stage/dist"
  cp dist/index.js         "$stage/dist/"
  cp server.js             "$stage/"
  cp package.json          "$stage/"
  cp package-lock.json     "$stage/"
  cp tsconfig.json         "$stage/"
  cp .env.example          "$stage/"
  cp prisma.config.ts      "$stage/"   # prisma generate reads the schema path from here
  cp index.ts app.ts       "$stage/"
  for d in controllers routes lib middleware types; do
    [ -d "$d" ] || fail "$d/ is missing — npm run build would fail on the server"
    cp -R "$d" "$stage/"
  done
  mkdir -p "$stage/prisma"
  cp prisma/schema.prisma  "$stage/prisma/"
  cp -R prisma/migrations  "$stage/prisma/"
  find "$stage" -name '.DS_Store' -delete

  if [ -e "$stage/.env" ]; then fail "a .env reached the staging dir"; fi
  if find "$stage" -name '*.test.ts' -o -name '__tests__' -o -name '*.md' | grep -q .; then
    fail "tests or docs reached the staging dir"
  fi
  if [ -e "$stage/node_modules" ]; then fail "node_modules reached the staging dir"; fi
  [ -d "$stage/prisma/migrations" ] || fail "prisma/migrations missing from the package"

  step "Backend: writing backend-deploy.zip"
  rm -f "$ROOT/backend-deploy.zip"
  (cd "$stage" && zip -rqX "$ROOT/backend-deploy.zip" . -x '.DS_Store' '**/.DS_Store')
}

case "$TARGET" in
  frontend)        package_frontend ;;
  frontend-static) package_frontend_static ;;
  backend)         package_backend ;;
  all)             package_frontend; package_backend ;;
  *) fail "unknown target '$TARGET' (expected frontend, frontend-static, backend or all)" ;;
esac

step "Done"
cd "$ROOT"
for z in frontend-deploy.zip frontend-static.zip backend-deploy.zip; do
  if [ -f "$z" ]; then
    printf '%s  %s  %s files\n' \
      "$(du -h "$z" | cut -f1)" "$z" "$(unzip -Z1 "$z" | wc -l | tr -d ' ')"
  fi
done
