-- AlterTable
ALTER TABLE "FlagshipEvent" ADD COLUMN "showSpeakers" BOOLEAN NOT NULL DEFAULT false;

-- Keep the section visible on events that were already showing it (it used to
-- appear whenever at least one speaker was entered).
UPDATE "FlagshipEvent" SET "showSpeakers" = true WHERE jsonb_array_length("speakers") > 0;
