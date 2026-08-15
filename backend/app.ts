import express from 'express';
import cors from 'cors';
import prayerTimesRouter from './routes/prayerTimes';
import authRouter from './routes/auth';
import eventsRouter from './routes/events';
import contactRouter from './routes/contact';
import sponsorshipRouter from './routes/sponsorship';
import weatherRouter from './routes/weather';
import announcementsRouter from './routes/announcements';
import { healthCheck } from './controllers/healthController';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', healthCheck);
  app.use('/api/prayer-times', prayerTimesRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/contact', contactRouter);
  app.use('/api/sponsorship', sponsorshipRouter);
  app.use('/api/weather', weatherRouter);
  app.use('/api/announcements', announcementsRouter);

  return app;
}
