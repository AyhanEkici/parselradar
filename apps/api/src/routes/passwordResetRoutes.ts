import express from 'express';
import { forgotPassword, resetPassword } from '../controllers/passwordResetController';
import { forgotPasswordLimiter, resetPasswordLimiter } from '../security/passwordResetRateLimiter';

const router = express.Router();

router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPasswordLimiter, resetPassword);

export default router;
