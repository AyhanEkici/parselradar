import express from 'express';
import { getCredits, devAddCredits } from '../controllers/creditController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/', auth, getCredits);
router.post('/dev-add', auth, devAddCredits);

export default router;
