import express from 'express';
import { auth } from '../middleware/auth';
import { exportAnalysisByProperty } from '../controllers/exportController';

const router = express.Router();

router.post('/analysis/:propertyId', auth, exportAnalysisByProperty);

export default router;
