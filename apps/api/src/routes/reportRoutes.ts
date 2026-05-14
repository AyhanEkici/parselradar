import express from 'express';
import { purchasePDF, getReports, downloadReport } from '../controllers/reportController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/:analysisRunId/purchase-pdf', auth, purchasePDF);
router.get('/', auth, getReports);
router.get('/:id/download', auth, downloadReport);

export default router;
