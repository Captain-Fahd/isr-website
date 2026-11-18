# Deploying to Hostinger

Two apps, one Hostinger account (`u328844267`):

| Target | Lives at | Shipped as |
|---|---|---|
| Frontend | `theisr.com.au` | **Project source** — Hostinger's build configuration runs the Next build and publishes `out/` |
| Backend | `api.theisr.com.au` | **Prebuilt bundle** — `npm start` → `node server.js` → `dist/index.js` |

The database and auth stay on Supabase. Hostinger serves the site and runs the API;
it does not host the data.

## Node versions

Each app has its own setting; they are independent.

| App | Currently | Set to | Why |
|---|---|---|---|
| Frontend | 20.x | 22.x (optional) | 20.x demonstrably works — the live bundle was built on it — but Node 20 reached end-of-life in April 2026, and 22 is what CI tests on. |
| Backend | check it | **22.x** (or 24.x) | `backend/package.json` declares `engines: >=22`, and Prisma 7.9 requires `^20.19 \|\| ^22.12 \|\| >=24`. On 20.x npm raises `EBADENGINE`, and anything below 20.19 breaks Prisma outright. |

## Build configuration

Both apps upload as a zip; the panel handles install, build and publish.

**Frontend** (`theisr.com.au`) — already set correctly:

| Field | Value |
|---|---|
| Framework preset | `Other` |
| Root directory | `./` — correct: the zip extracts the Next project *at* the app root, not the monorepo root |
| Package manager | `npm` |
| Build command | `npm run build` |
| Output directory | `out` |
| Entry file | *(empty)* — the output is static files, there is no server process |

There is no install command field; Hostinger installs from `package-lock.json` itself.
That install **does** include dev dependencies, which matters because `typescript`,
`tailwindcss` and the `@types/*` packages are dev dependencies and `next build` fails
without them. This is confirmed, not assumed: the live site serves
`_next/static/chunks/1255-925cc58e720b4caf.js`, the exact vendor-chunk hash a clean
`npm ci` + `npm run build` produces from this lockfile.

**Backend** (`api.theisr.com.au`):

| Field | Value |
|---|---|
| Root directory | `./` |
| Package manager | `npm` |
| Build command | `npm run build`, or empty |
| Entry file | `server.js` |

Either build command is safe. `dist/index.js` ships prebuilt, and the TypeScript sources
ship beside it, so a configured build command rebuilds from sources that match the bundle
rather than failing on a missing `index.ts`. Verified: running `npm run build` on the
extracted package reproduces a byte-identical `dist/index.js`.

## 1. Build the artifacts

```bash
scripts/package-deploy.sh            # frontend + backend
scripts/package-deploy.sh frontend   # or one at a time
```

- **`frontend-deploy.zip`** — the Next project source: `package.json`, `package-lock.json`,
  the config files, `app/`, `components/`, `lib/`, `public/` and `.env.production`.
  No tests, e2e, `node_modules`, `.next` or `out`. The script type-checks first, so a
  broken build fails locally rather than in a deploy log.
- **`backend-deploy.zip`** — the prebuilt `dist/index.js`, `server.js`, the TypeScript
  sources (`index.ts`, `app.ts`, `controllers/`, `routes/`, `lib/`, `middleware/`,
  `types/`), `package.json`, `package-lock.json`, `tsconfig.json`, `prisma.config.ts`,
  `prisma/` (schema + migrations) and `.env.example`. No tests, docs, seeds or scripts.

Neither archive contains a `.env` or `node_modules`, so extracting over a live directory
leaves the server's secrets and installed packages alone.

`scripts/package-deploy.sh frontend-static` is the escape hatch: it builds `out/` locally
and writes `frontend-static.zip`, whose contents drop straight into a web root. Use it only
to bypass the server-side build.

## 2. Run pending migrations (before the backend ships)

The migration adds a **nullable** column, so it is backwards compatible — the currently
deployed API keeps working between this step and step 3.

```bash
cd backend
DATABASE_URL='<production pooler URL>' npx prisma migrate deploy
```

As of this release production is missing `20261117000000_add_flagship_draft`
(`FlagshipEvent.draft JSONB`). Without it the draft/preview endpoints will error.

## 3. Deploy the backend

1. hPanel → the `api.theisr.com.au` app → set Node to 22.x and Entry file to `server.js`,
   then **stop** the app.
2. Clear the app directory, keeping **`.env` and `node_modules`**. The package ships no
   `.env`, so the server's own secrets survive; clearing removes leftovers from the old
   source upload (`__tests__/`, `test/`, `scripts/`, `seed/`, markdown).
3. Upload and extract `backend-deploy.zip` into the app directory.
4. Let the panel install. `npm install` triggers the `postinstall` hook, which runs
   `prisma generate` — required, because `@prisma/client` v7 ships no generate hook of its
   own and the client does not exist until it runs. If the client is somehow missing, run
   `npx prisma generate` by hand.
5. **Start** the app.

## 4. Deploy the frontend

1. Clear the app directory, **including any `.env.local` or `.env.production.local`**.
   Next loads env values in the order `process.env` → `.env.production.local` →
   `.env.local` → `.env.production` → `.env`, so either file would outrank the
   `.env.production` in the package and bake the wrong `NEXT_PUBLIC_API_URL` into the
   bundle. For the same reason, don't set `NEXT_PUBLIC_API_URL` in the panel's
   environment variables unless you mean it to win. A stray `.env` is harmless; it ranks last.
2. Upload and extract `frontend-deploy.zip`.
3. Trigger the build. It installs from the lockfile and exports 159 files to `out/`.
4. After publishing, confirm `/sacred-union/tickets/` is gone from the served output. If
   the publish step merges rather than replaces, that stale directory survives and keeps
   serving the old page (see step 5).

## 5. Verify

```bash
curl -s https://api.theisr.com.au/health                                  # OK
curl -so /dev/null -w '%{http_code}\n' https://api.theisr.com.au/api/flagship-events/admin
                                                                          # 401 (404 = old build still live)
curl -s https://theisr.com.au/sacred-union/ | grep -c sacred-union        # page serves
curl -so /dev/null -w '%{http_code}\n' https://theisr.com.au/sacred-union/tickets/
                                                                          # 404 (200 = stale dir not pruned)
```

Then load `/sacred-union/` in a browser: the booking section sits at the foot of the page
with the TryBooking widget, and the hero / sticky-bar "Get tickets" buttons scroll to it.
The section is gated on the live `ticketsOnSale` flag (currently `true` in production).

## Rollback

Both archives are committed to git, so the previous release is
`git checkout HEAD~1 -- frontend-deploy.zip backend-deploy.zip` away. Hostinger's own
backups cover the app directories.
