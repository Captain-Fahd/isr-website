# Seeding Sample Events

Sample data for the ISR events API. Creates **3 events** — 2 past and 1 upcoming — via
`POST /api/events` as documented in [API.md](./API.md).

Base URL (dev): `http://localhost:4000`

---

## Quick start (script)

From `backend/` with the server running:

```bash
chmod +x seed.sh   # first time only
./seed.sh
```

Prompts for the admin password unless `ADMIN_PASSWORD` is set. Optional overrides:

| Variable | Default |
|---|---|
| `BASE_URL` | `http://localhost:4000` |
| `ADMIN_EMAIL` | `admin@isr.org` |
| `ADMIN_PASSWORD` | *(prompted)* |

```bash
ADMIN_PASSWORD='your-password' ./seed.sh
```

The manual steps below mirror what the script does.

---

## Prerequisites

1. Backend running (`npm run dev` from `backend/`).
2. Supabase env vars configured (database + storage bucket for event images).
3. An admin user in Supabase Auth with `app_metadata.role === "admin"`.
4. `curl` available (`curl.exe` on Windows if PowerShell aliases `curl` to `Invoke-WebRequest`).

Placeholder poster images live in [`seed/images/`](./seed/images/) and use ISR palette colours.
They are only used as upload payloads — the API stores them in Supabase Storage and returns
real `imageUrl` values.

---

## Step 1 — Sign in as admin

Replace the email and password with your admin credentials.

```bash
curl -s -X POST http://localhost:4000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@isr.org","password":"YOUR_PASSWORD"}'
```

Copy `data.session.access_token` from the response. Export it for the commands below:

```bash
# bash / macOS / Linux
export TOKEN="<access_token>"

# PowerShell
$TOKEN = "<access_token>"
```

---

## Step 2 — Create the sample events

All create requests use **`multipart/form-data`** with an `image` file field (required).
Dates use ISO 8601 with Melbourne offset (`+10:00`). Relative to **21 July 2026**, events 1–2
are past; event 3 is upcoming.

### Event 1 — Semester 1 Welcome BBQ *(past)*

| Field | Value |
|---|---|
| `name` | Semester 1 Welcome BBQ |
| `date` | `2026-03-15T17:00:00+10:00` |
| `description` | Kick off the semester with food, games, and a chance to meet fellow ISR members at RMIT City campus. |
| `ticketUrl` | `https://example.com/tickets/isr-welcome-bbq` |
| `image` | `seed/images/welcome-bbq.jpg` |

```bash
curl -X POST http://localhost:4000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Semester 1 Welcome BBQ" \
  -F "date=2026-03-15T17:00:00+10:00" \
  -F "description=Kick off the semester with food, games, and a chance to meet fellow ISR members at RMIT City campus." \
  -F "ticketUrl=https://example.com/tickets/isr-welcome-bbq" \
  -F "image=@seed/images/welcome-bbq.jpg"
```

**PowerShell** (run from `backend/`):

```powershell
curl.exe -X POST http://localhost:4000/api/events `
  -H "Authorization: Bearer $TOKEN" `
  -F "name=Semester 1 Welcome BBQ" `
  -F "date=2026-03-15T17:00:00+10:00" `
  -F "description=Kick off the semester with food, games, and a chance to meet fellow ISR members at RMIT City campus." `
  -F "ticketUrl=https://example.com/tickets/isr-welcome-bbq" `
  -F "image=@seed/images/welcome-bbq.jpg"
```

---

### Event 2 — Community Iftar *(past)*

| Field | Value |
|---|---|
| `name` | Community Iftar |
| `date` | `2026-04-05T18:30:00+10:00` |
| `description` | Break fast together during Ramadan with a shared meal, short reflection, and space to connect after a day of fasting. |
| `ticketUrl` | `https://example.com/tickets/isr-community-iftar` |
| `image` | `seed/images/community-iftar.jpg` |

```bash
curl -X POST http://localhost:4000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Community Iftar" \
  -F "date=2026-04-05T18:30:00+10:00" \
  -F "description=Break fast together during Ramadan with a shared meal, short reflection, and space to connect after a day of fasting." \
  -F "ticketUrl=https://example.com/tickets/isr-community-iftar" \
  -F "image=@seed/images/community-iftar.jpg"
```

---

### Event 3 — Eid al-Adha Dinner *(upcoming)*

| Field | Value |
|---|---|
| `name` | Eid al-Adha Dinner |
| `date` | `2026-08-15T18:00:00+10:00` |
| `description` | Celebrate Eid al-Adha with the ISR community. Dinner, activities, and an opportunity to welcome new and returning members. |
| `ticketUrl` | `https://example.com/tickets/isr-eid-dinner` |
| `image` | `seed/images/eid-dinner.jpg` |

```bash
curl -X POST http://localhost:4000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Eid al-Adha Dinner" \
  -F "date=2026-08-15T18:00:00+10:00" \
  -F "description=Celebrate Eid al-Adha with the ISR community. Dinner, activities, and an opportunity to welcome new and returning members." \
  -F "ticketUrl=https://example.com/tickets/isr-eid-dinner" \
  -F "image=@seed/images/eid-dinner.jpg"
```

---

## Step 3 — Verify

```bash
# All events (ascending by date)
curl -s http://localhost:4000/api/events | jq

# Past only (should return events 1 & 2, newest first)
curl -s "http://localhost:4000/api/events?filter=past" | jq

# Upcoming only (should return event 3)
curl -s "http://localhost:4000/api/events?filter=upcoming" | jq
```

Expected counts after a fresh seed: **2 past**, **1 upcoming**.

---

## Re-seeding / cleanup

There is no bulk-delete endpoint. To remove seeded events, sign in again and delete by id:

```bash
curl -X DELETE http://localhost:4000/api/events/<id> \
  -H "Authorization: Bearer $TOKEN"
```

Each delete also removes the event's image from Supabase Storage.

---

## Sample data summary

| # | Name | Date (Melbourne) | Status |
|---|---|---|---|
| 1 | Semester 1 Welcome BBQ | 15 Mar 2026, 5:00 pm | Past |
| 2 | Community Iftar | 5 Apr 2026, 6:30 pm | Past |
| 3 | Eid al-Adha Dinner | 15 Aug 2026, 6:00 pm | Upcoming |

All `ticketUrl` values point to `https://example.com/tickets/...` (dummy links).
Poster images are placeholders in `seed/images/`; uploaded copies are served from Supabase
Storage after creation.
