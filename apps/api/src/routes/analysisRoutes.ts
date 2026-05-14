import express from 'express';
import { quickScore, parselInsight, developerFit } from '../controllers/analysisController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/:propertyId/quick-score', auth, quickScore);
router.post('/:propertyId/parsel-insight', auth, parselInsight);
router.post('/:propertyId/developer-fit', auth, developerFit);

export default router;
