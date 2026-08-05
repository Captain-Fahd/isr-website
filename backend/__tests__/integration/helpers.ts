import { prisma } from '../../lib/prisma';
import { sampleAnnouncements, sampleEvents } from '../../test/fixtures';

export async function resetDatabase() {
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
