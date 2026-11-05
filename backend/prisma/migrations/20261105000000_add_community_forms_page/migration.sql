-- CreateTable
CREATE TABLE "CommunityFormsPage" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL DEFAULT '',
    "intro" TEXT NOT NULL DEFAULT '',
    "buttons" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityFormsPage_pkey" PRIMARY KEY ("id")
);

-- Seed the singleton row.
INSERT INTO "CommunityFormsPage" ("id", "enabled", "title", "intro", "buttons", "updatedAt")
VALUES (1, false, 'Get in Touch', '', '[]', CURRENT_TIMESTAMP);
