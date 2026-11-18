-- AlterTable
ALTER TABLE "FlagshipEvent" ADD COLUMN "sectionOrder" JSONB NOT NULL DEFAULT '["about","speakers","programme","venue","faqs"]';
