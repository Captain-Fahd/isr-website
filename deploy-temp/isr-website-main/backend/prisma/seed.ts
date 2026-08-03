import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  await prisma.announcement.create({
    data: {
      title: 'Welcome to ISR!',
      body: 'The Islamic Society of RMIT is excited to kick off Semester 2, 2026. Stay tuned for upcoming events, prayer times, and community updates.',
      pinned: true,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Friday Prayer Location Update',
      body: 'Jumu\'ah this week will be held in Building 8, Level 3, Room 9 at 1:15 PM. All are welcome.',
      pinned: false,
    },
  });

  console.log('Seeded 2 announcements.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
