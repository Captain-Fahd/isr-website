import { Router } from 'express';
import { getMelbourneWeather } from '../controllers/weatherController';

const router = Router();

router.get('/', getMelbourneWeather);

export default router;
