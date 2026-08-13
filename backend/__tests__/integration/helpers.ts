import { prisma } from '../../lib/prisma';
import { sampleAnnouncements, sampleEvents } from '../../test/fixtures';
import { assertDisposableDatabase } from '../../test/guard';

export async function resetDatabase() {
  // Deletes every row — never let it run against a real deployment.
  assertDisposableDatabase('integration resetDatabase()');
  await prisma.event.deleteMany();
  await prisma.announcement.deleteMany();
}

export async function seedPublicData() {
  const events = await Promise.all(
    sampleEvents.map((data) => prisma.event.create({ data })),
  );
  const announcements = await Promise.all(
    sampleAnnouncements.map((data) => prisma.announcement.create({ data })),
  );
  return { events, announcements };
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
