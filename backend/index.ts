import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prayerTimesRouter from './routes/prayerTimes';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.send('OK'));
app.use('/api/prayer-times', prayerTimesRouter);

app.listen(port, () => console.log(`Server running on port ${port}`));