import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { sampleAnnouncements, sampleEvents } from './fixtures';

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
