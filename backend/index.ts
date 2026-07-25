import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prayerTimesRouter from './routes/prayerTimes';
import authRouter from './routes/auth';
import eventsRouter from './routes/events';
import contactRouter from './routes/contact';
import announcementsRouter from './routes/announcements';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.send('OK'));
app.use('/api/prayer-times', prayerTimesRouter);
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/announcements', announcementsRouter);

app.listen(port, () => console.log(`Server running on port ${port}`));