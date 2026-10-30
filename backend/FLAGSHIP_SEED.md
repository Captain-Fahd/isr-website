# Backfilling The Sacred Union

The Sacred Union was originally a hardcoded config (`frontend/lib/flagship/sacred-union.ts`).
It's now the first row in the `FlagshipEvent` table, backfilled by the `INSERT` inside
[`prisma/migrations/20261030000000_add_flagship_events/migration.sql`](./prisma/migrations/20261030000000_add_flagship_events/migration.sql).

## Prerequisites

1. A Supabase Storage bucket named `flagship-images` (public read). The upload script below
   will try to create it if missing; if that fails (e.g. insufficient permissions), create it
   manually in the Supabase dashboard first — same prerequisite as the existing `event-images`
   and `announcement-images` buckets.
2. Backend env vars configured (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `DATABASE_URL`).

## Step 1 — Upload the images

The migration's `INSERT` references five images by placeholder (`__BACKDROP_URL__`,
`__BACKDROP_MOBILE_URL__`, `__BANNER_URL__`, `__VENUE_IMAGE_URL__`, `__OG_IMAGE_URL__`).
Upload the real files and get their Storage URLs:

```bash
cd backend
npx tsx scripts/upload-sacred-union-images.ts            # dry run — prints the plan
npx tsx scripts/upload-sacred-union-images.ts --commit    # uploads, prints each URL
```

## Step 2 — Fill in the migration

Replace each `__..._URL__` placeholder in the migration's `INSERT` with the matching URL
printed above.

## Step 3 — Apply the migration

```bash
npx prisma migrate deploy
```

This creates `FlagshipEvent`, inserts the Sacred Union row (carrying over whatever
`SiteSettings.flagshipReleased` was set to, so visibility isn't silently flipped), then
drops `SiteSettings`.

## Re-seeding / fixing a mistake

There's no bulk-delete endpoint. To redo the backfill, sign in as admin and either edit the
row through `/admin/flagship-events/`, or:

```bash
# Delete by id (find it first with GET /api/flagship-events)
curl -X DELETE http://localhost:4000/api/flagship-events/<id> \
  -H "Authorization: Bearer $TOKEN"
```

Each delete also removes every image the event referenced from Supabase Storage.
