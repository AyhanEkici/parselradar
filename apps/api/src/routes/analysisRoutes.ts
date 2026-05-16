import express from 'express';
import { quickScore, parselInsight, developerFit } from '../controllers/analysisController';
import { analysisLimiter } from '../middleware/rateLimiter';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/:propertyId/quick-score', analysisLimiter, auth, quickScore);
router.post('/:propertyId/parsel-insight', analysisLimiter, auth, parselInsight);
router.post('/:propertyId/developer-fit', analysisLimiter, auth, developerFit);

export default router;
