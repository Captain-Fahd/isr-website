-- AlterTable
ALTER TABLE "FlagshipEvent" ADD COLUMN "aboutOrder" JSONB NOT NULL DEFAULT '["description","highlights"]';
