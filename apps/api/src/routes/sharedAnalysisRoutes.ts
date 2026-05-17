import express from 'express';
import { auth } from '../middleware/auth';
import { createSharedAnalysis, getSharedAnalyses } from '../controllers/sharedAnalysisController';

const router = express.Router();

router.post('/workspace/:organizationId/shared-analysis', auth, createSharedAnalysis);
router.get('/workspace/:organizationId/shared-analysis', auth, getSharedAnalyses);

export default router;
