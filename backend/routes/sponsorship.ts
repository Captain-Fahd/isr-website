import { Router } from 'express';
import { sendSponsorshipEnquiry } from '../controllers/sponsorshipController';

const router = Router();

router.post('/', sendSponsorshipEnquiry);

export default router;
