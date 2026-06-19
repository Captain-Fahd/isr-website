import { Router } from 'express';
import { getTodayPrayerTimes, getPrayerTimesByDate, getMonthlyCalendar } from '../controllers/prayerTimesController';

const router = Router();

router.get('/', getTodayPrayerTimes);
router.get('/calendar', getMonthlyCalendar);
router.get('/:date', getPrayerTimesByDate);

export default router;