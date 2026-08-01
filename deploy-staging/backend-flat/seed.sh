#!/usr/bin/env bash
set -euo pipefail

# Seed 3 sample ISR events (2 past, 1 upcoming) via POST /api/events.
# Run from backend/: ./seed.sh
# Requires: curl, node (for JSON parsing), backend running, admin credentials.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BASE_URL="${BASE_URL:-http://localhost:4000}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@isr.org}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"

if [[ -z "$ADMIN_PASSWORD" ]]; then
  read -rsp "Admin password ($ADMIN_EMAIL): " ADMIN_PASSWORD
  echo
fi

echo "Signing in as $ADMIN_EMAIL..."
signin_response="$(curl -s -X POST "$BASE_URL/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")"

TOKEN="$(node -e "
  const r = JSON.parse(process.argv[1]);
  if (r.error) {
    console.error('Sign-in failed:', r.error);
    process.exit(1);
  }
  process.stdout.write(r.data.session.access_token);
" "$signin_response")"

create_event() {
  local name="$1"
  local date="$2"
  local description="$3"
  local ticket_url="$4"
  local image="$5"

  echo "Creating: $name"
  response="$(curl -s -X POST "$BASE_URL/api/events" \
    -H "Authorization: Bearer $TOKEN" \
    -F "name=$name" \
    -F "date=$date" \
    -F "description=$description" \
    -F "ticketUrl=$ticket_url" \
    -F "image=@$image")"

  node -e "
    const r = JSON.parse(process.argv[1]);
    if (r.error) {
      console.error('  Failed:', r.error);
      process.exit(1);
    }
    console.log('  -> id', r.data.id);
  " "$response"
}

create_event \
  "Semester 1 Welcome BBQ" \
  "2026-03-15T17:00:00+10:00" \
  "Kick off the semester with food, games, and a chance to meet fellow ISR members at RMIT City campus." \
  "https://example.com/tickets/isr-welcome-bbq" \
  "seed/images/welcome-bbq.jpg"

create_event \
  "Community Iftar" \
  "2026-04-05T18:30:00+10:00" \
  "Break fast together during Ramadan with a shared meal, short reflection, and space to connect after a day of fasting." \
  "https://example.com/tickets/isr-community-iftar" \
  "seed/images/community-iftar.jpg"

create_event \
  "Eid al-Adha Dinner" \
  "2026-08-15T18:00:00+10:00" \
  "Celebrate Eid al-Adha with the ISR community. Dinner, activities, and an opportunity to welcome new and returning members." \
  "https://example.com/tickets/isr-eid-dinner" \
  "seed/images/eid-dinner.jpg"

echo
echo "Verifying event counts..."
events_response="$(curl -s "$BASE_URL/api/events")"
past_response="$(curl -s "$BASE_URL/api/events?filter=past")"
upcoming_response="$(curl -s "$BASE_URL/api/events?filter=upcoming")"

node -e "
  const all = JSON.parse(process.argv[1]).data;
  const past = JSON.parse(process.argv[2]).data;
  const upcoming = JSON.parse(process.argv[3]).data;
  console.log('  Total:', all.length, '| Past:', past.length, '| Upcoming:', upcoming.length);
" "$events_response" "$past_response" "$upcoming_response"

echo "Done."
