-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "recurrenceEndDate" TIMESTAMP(3),
ADD COLUMN     "recurrenceFrequency" "RecurrenceFrequency",
ADD COLUMN     "recurrenceInterval" INTEGER;
