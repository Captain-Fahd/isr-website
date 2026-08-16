-- CreateTable
CREATE TABLE "EventLike" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventLike_eventId_idx" ON "EventLike"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventLike_eventId_clientId_key" ON "EventLike"("eventId", "clientId");

-- AddForeignKey
ALTER TABLE "EventLike" ADD CONSTRAINT "EventLike_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
