import express from 'express';
import { register, login, logout, getMe } from '../controllers/authController';
import { authLimiter } from '../middleware/rateLimiter';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authLimiter, logout);
router.get('/me', auth, getMe);

export default router;
