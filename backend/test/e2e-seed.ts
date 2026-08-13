// NOTE: deliberately does NOT load `backend/.env`. This script deletes every
// row, and reading the production DATABASE_URL out of .env is how the live
// database got wiped once already. DATABASE_URL must be passed in explicitly.
import { assertDisposableDatabase } from './guard';

assertDisposableDatabase('e2e seed');

const { prisma } = await import('../lib/prisma');
const { sampleAnnouncements, sampleEvents } = await import('./fixtures');

async function main() {
  await prisma.event.deleteMany();
  await prisma.announcement.deleteMany();

  await prisma.event.createMany({ data: sampleEvents });
  await prisma.announcement.createMany({ data: sampleAnnouncements });

  const [events, announcements] = await Promise.all([
    prisma.event.findMany({ orderBy: { id: 'asc' } }),
    prisma.announcement.findMany({ orderBy: { id: 'asc' } }),
  ]);

  console.log(
    JSON.stringify({
      events: events.map((e) => ({ id: e.id, name: e.name })),
      announcements: announcements.map((a) => ({ id: a.id, title: a.title })),
    }),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
