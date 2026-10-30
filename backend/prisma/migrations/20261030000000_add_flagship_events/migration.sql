-- CreateTable
CREATE TABLE "FlagshipEvent" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "featuredOnHome" BOOLEAN NOT NULL DEFAULT false,
    "released" BOOLEAN NOT NULL DEFAULT false,
    "ticketUrl" TEXT NOT NULL DEFAULT '',
    "ticketEventId" TEXT NOT NULL DEFAULT '',
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "timeLabel" TEXT NOT NULL,
    "venue" JSONB NOT NULL,
    "banner" JSONB NOT NULL,
    "ogImage" TEXT NOT NULL,
    "theme" JSONB NOT NULL,
    "highlights" JSONB NOT NULL DEFAULT '[]',
    "speakers" JSONB NOT NULL DEFAULT '[]',
    "speakerPlaceholderCount" INTEGER NOT NULL DEFAULT 0,
    "programme" JSONB NOT NULL DEFAULT '[]',
    "faqs" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlagshipEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FlagshipEvent_slug_key" ON "FlagshipEvent"("slug");

-- Backfill: migrate the one hardcoded flagship event (frontend/lib/flagship/sacred-union.ts)
-- into the new table, carrying over whatever the live SiteSettings.flagshipReleased value
-- currently is so production visibility isn't silently flipped by this migration. Image URLs
-- below are the output of a one-off run of backend/scripts/upload-sacred-union-images.ts
-- against the "flagship-images" Supabase Storage bucket — see backend/FLAGSHIP_SEED.md.
INSERT INTO "FlagshipEvent" (
  "slug", "name", "tagline", "description", "phase",
  "featuredOnHome", "released", "ticketUrl", "ticketEventId",
  "start", "end", "dateLabel", "timeLabel",
  "venue", "banner", "ogImage", "theme",
  "highlights", "speakers", "speakerPlaceholderCount", "programme", "faqs",
  "updatedAt"
)
SELECT
  'sacred-union',
  'The Sacred Union',
  'Prepare for the future you pray for',
  E'The Islamic Society of RMIT proudly presents one of Victoria’s most anticipated Muslim marriage conferences of the year.\n\nMore than preparing for marriage, it’s about investing in yourself, refining your character, and building the foundations for a blessed marriage and a lasting legacy.',
  'save-the-date',
  true,
  COALESCE((SELECT "flagshipReleased" FROM "SiteSettings" WHERE "id" = 1), false),
  '',
  '1662679',
  '2026-11-28T13:30:00+11:00'::timestamptz,
  '2026-11-28T19:30:00+11:00'::timestamptz,
  'Saturday 28 November 2026',
  '1:30 pm – 7:30 pm',
  '{
    "name": "RMIT Storey Hall",
    "address": "Building 16, 336–348 Swanston St, Melbourne VIC 3000",
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=RMIT+Storey+Hall,+336-348+Swanston+Street,+Melbourne+VIC+3000",
    "notes": [
      "Melbourne Central Station is a short walk away, with trams along Swanston Street.",
      "Prayer space available on site"
    ],
    "image": {
      "src": "https://fmulogrxdtkmdrhhcldz.supabase.co/storage/v1/object/public/flagship-images/sacred-union/venue.webp",
      "alt": "Storey Hall auditorium at RMIT",
      "width": 1024,
      "height": 576
    }
  }'::jsonb,
  '{
    "src": "https://fmulogrxdtkmdrhhcldz.supabase.co/storage/v1/object/public/flagship-images/sacred-union/banner.webp",
    "alt": "Save the date — The Sacred Union: The Marriage Conference. Renowned speakers, lectures, men’s & women’s segment.",
    "width": 1600,
    "height": 900
  }'::jsonb,
  'https://fmulogrxdtkmdrhhcldz.supabase.co/storage/v1/object/public/flagship-images/sacred-union/og-image.png',
  '{
    "dark": "#5B0B05",
    "onDark": "#EAE3D8",
    "light": "#EAE3D8",
    "onLight": "#561610",
    "primary": "#D43325",
    "onPrimary": "#FFFFFF",
    "accent": "#509589",
    "hero": {
      "backdrop": "https://fmulogrxdtkmdrhhcldz.supabase.co/storage/v1/object/public/flagship-images/sacred-union/backdrop.webp",
      "backdropMobile": "https://fmulogrxdtkmdrhhcldz.supabase.co/storage/v1/object/public/flagship-images/sacred-union/backdrop-mobile.webp",
      "text": "#561610",
      "heading": "#561610",
      "background": "radial-gradient(60% 45% at 0% 0%, rgb(255 255 255 / 0.95), transparent 70%), radial-gradient(45% 35% at 100% 0%, color-mix(in srgb, var(--su-dark) 30%, transparent), transparent 75%), radial-gradient(30% 45% at 100% 65%, color-mix(in srgb, var(--su-dark) 25%, transparent), transparent 75%), radial-gradient(45% 7rem at 0% 100%, var(--su-dark), transparent), linear-gradient(to bottom, color-mix(in srgb, var(--su-dark) 8%, var(--su-light)) 0%, color-mix(in srgb, var(--su-light), white 40%) 35%, color-mix(in srgb, var(--su-light), white 25%) 55%, color-mix(in srgb, var(--su-dark) 25%, var(--su-light)) calc(100% - 14rem), color-mix(in srgb, var(--su-dark) 40%, var(--su-light)) calc(100% - 6rem), var(--su-dark) 100%)"
    }
  }'::jsonb,
  '[
    {
      "title": "Renowned Scholars",
      "body": "Lectures and discussions with scholars invited to the conference."
    },
    {
      "title": "Dedicated breakout rooms for brothers and sisters",
      "body": "Separate spaces for brothers and sisters throughout the programme."
    },
    {
      "title": "Panel Discussion",
      "body": "A conversation with the panel on the questions that matter for marriage."
    }
  ]'::jsonb,
  '[]'::jsonb,
  3,
  '[]'::jsonb,
  '[
    {
      "question": "Who can attend?",
      "answer": "Everyone is welcome: RMIT and non-RMIT students, Muslims and non-Muslims, families and friends."
    },
    {
      "question": "When do tickets go on sale?",
      "answer": "Tickets will be sold through TryBooking. Join the mailing list or our WhatsApp community and we’ll let you know the moment they’re live."
    },
    {
      "question": "Is there a dress code?",
      "answer": "Smart casual / modest dress."
    }
  ]'::jsonb,
  CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "SiteSettings";
