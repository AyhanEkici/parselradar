import express from 'express';
import { register, login, logout, getMe, getSessionDiagnostics } from '../controllers/authController';
import { authLimiter } from '../middleware/rateLimiter';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authLimiter, logout);
router.get('/me', auth, getMe);
router.get('/session-diagnostics', auth, getSessionDiagnostics);

export default router;
