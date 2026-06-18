# CLAUDE.md — ISR Website

## Project

Website for the **Islamic Society of RMIT (ISR)**. Monorepo with a Next.js frontend and Express backend, using Supabase for the database and auth.

## Stack

- **Frontend:** Next.js (App Router)
- **Backend:** Express.js
- **Database / Auth:** Supabase
- **Prayer Times:** Aladhan API (external)

## Repo Structure

```
isr-website/
├── frontend/      # Next.js app
├── backend/       # Express API
└── CLAUDE.md
```

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, mission statement |
| `/prayer-times` | Daily prayer times via Aladhan API |
| `/events` | Upcoming/past events (public view) |
| `/mission` | Mission & Vision statements |
| `/about` | About ISR and committee |
| `/contact` | Contact form, WhatsApp, Instagram links |
| `/membership` | Redirects to external membership page |
| `/admin` | Protected — event CRUD for admins |

## Colour Palette

| Name | Hex |
|---|---|
| Cream | `#EAE3D8` |
| Light Blue | `#98AEA8` |
| Yellow-ish | `#EBE8CB` |
| Turquoise | `#509589` |
| Dark Red | `#5B0B05` |
| Bright Red | `#D43325` |

Always use these exact hex values. Do not introduce colours outside this palette.

## Key Constraints

- Closed team — no external contributors.
- Admin panel requires Supabase Auth; protect all `/admin` routes server-side.
- `main` is production. Work against `dev`; branch as `feature/*`, `fix/*`, or `chore/*`.
- Target launch: **Semester 2, 2026**.
- Hosting is TBD — avoid hard-coding platform-specific assumptions.
