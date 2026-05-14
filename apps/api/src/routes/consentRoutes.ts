import express from 'express';
import { submitConsent } from '../controllers/consentController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/:propertyId/consent', auth, submitConsent);

export default router;
