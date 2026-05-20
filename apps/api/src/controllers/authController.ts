import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { logAuditEvent } from '../utils/auditLog';
import { JWT_SECRET } from '../config/env';
import { AuthRequest } from '../middleware/auth';
import { roleHydrationVerifier } from '../session/roleHydrationVerifier';
import { sessionIntegrityValidator } from '../session/sessionIntegrityValidator';

function normalizeEmail(email: unknown) {
  return String(email || '').trim().toLowerCase();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function safeAuthDebug(event: string, payload: Record<string, unknown>) {
  if (process.env.AUTH_SAFE_DEBUG !== 'true') return;
  console.info(`[auth-debug] ${event}`, payload);
}

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

export const register = async (req: Request, res: Response) => {
  const { password, name } = req.body;
  const email = normalizeEmail(req.body?.email);
  safeAuthDebug('register_attempt', { routeHit: '/auth/register', emailNormalized: Boolean(email) });
  if (!email || !password || !name) return res.status(400).json({ error: 'Eksik bilgi' });
  if (!isMongoReady()) return res.status(503).json({ error: 'Veri deposu hazır değil' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, passwordChangedAt: new Date(), name, role: 'USER' });
    console.log('[authController register] SIGNING TOKEN', {
      jwtSecretLength: JWT_SECRET?.length,
      jwtSecretStart: JWT_SECRET?.substring(0, 5),
    });
    const token = jwt.sign({ id: String(user._id), userId: String(user._id), sub: String(user._id), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  (global as any).lastJwtDebug = {
    timestamp: new Date().toISOString(),
    type: 'token_signed_register',
    jwtSecretLength: JWT_SECRET?.length,
    jwtSecretStart: JWT_SECRET?.substring(0, 5),
    tokenLength: token.length,
    userId: String(user._id),
  };
    console.log('[authController register] TOKEN SIGNED', { tokenLength: token.length });
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
  res.json({ token, user: { id: String(user._id), email: user.email, name: user.name, role: user.role } });
  await logAuditEvent({
    type: 'auth_register',
    actorUserId: user._id.toString(),
    actorRole: user.role,
    targetType: 'User',
    targetId: user._id.toString(),
    message: 'Register success',
    metadata: { email, name },
    ip: req.ip,
    userAgent: req.get('user-agent'),
    success: true,
  });
};

export const login = async (req: Request, res: Response) => {
  const { password } = req.body;
  const email = normalizeEmail(req.body?.email);
  safeAuthDebug('login_attempt', {
    routeHit: '/auth/login',
    emailNormalized: email,
    passwordLength: String(password || '').length,
  });
  if (!isMongoReady()) return res.status(503).json({ error: 'Veri deposu hazır değil' });
  let user: any = await User.findOne({ email }).select('+passwordHash');
  if (!user && email) {
    // Backward-compatible recovery for legacy mixed-case emails.
    user = await User.findOne({ email: { $regex: `^${escapeRegExp(email)}$`, $options: 'i' } }).select('+passwordHash');
    if (user && user.email !== email) {
      user.email = email;
      await user.save();
    }
  }
  safeAuthDebug('login_user_lookup', {
    userFound: Boolean(user),
    role: user?.role || 'UNKNOWN',
    hasPasswordHash: Boolean((user as any)?.passwordHash),
  });
  if (!user) return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
  if (!(user as any)?.passwordHash) return res.status(401).json({ error: 'Şifre doğrulama alanı eksik' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  safeAuthDebug('login_password_check', { passwordValid: valid, role: user.role });
  if (!valid) return res.status(401).json({ error: 'Şifre hatalı' });
    console.log('[authController login] SIGNING TOKEN', {
      jwtSecretLength: JWT_SECRET?.length,
      jwtSecretStart: JWT_SECRET?.substring(0, 5),
      userId: String(user._id),
    });
    const token = jwt.sign({ id: String(user._id), userId: String(user._id), sub: String(user._id), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  (global as any).lastJwtDebug = {
    timestamp: new Date().toISOString(),
    type: 'token_signed_login',
    jwtSecretLength: JWT_SECRET?.length,
    jwtSecretStart: JWT_SECRET?.substring(0, 5),
    tokenLength: token.length,
    userId: String(user._id),
  };
    console.log('[authController login] TOKEN SIGNED', { tokenLength: token.length });
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
  const roleState = roleHydrationVerifier(user.role);
  if (!roleState.valid) return res.status(401).json({ error: 'Geçersiz rol durumu' });
  safeAuthDebug('login_token_issued', {
    tokenIssued: Boolean(token),
    role: roleState.normalizedRole,
  });

  res.json({ token, user: { id: String(user._id), email: user.email, name: user.name, role: roleState.normalizedRole } });
  await logAuditEvent({
    type: 'auth_login',
    actorUserId: user._id.toString(),
    actorRole: user.role,
    targetType: 'User',
    targetId: user._id.toString(),
    message: 'Login success',
    metadata: { email },
    ip: req.ip,
    userAgent: req.get('user-agent'),
    success: true,
  });
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/'
  });
  res.json({ ok: true });
  logAuditEvent({
    type: 'auth_logout',
    actorUserId: undefined,
    actorRole: undefined,
    targetType: 'User',
    targetId: undefined,
    message: 'Logout',
    metadata: {},
    ip: req.ip,
    userAgent: req.get('user-agent'),
    success: true,
  });
};

export const getMe = (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Yetkisiz' });
  res.json({ id: user._id, email: user.email, name: user.name, role: user.role });
};

export const getSessionDiagnostics = (req: AuthRequest, res: Response) => {
  const authHeader = req.headers['authorization'];
  const bearer = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const cookieToken = req.cookies?.token;
  const token = bearer || cookieToken;
  const integrity = sessionIntegrityValidator(token);
  const roleState = roleHydrationVerifier(req.user?.role);

  return res.json({
    authenticated: Boolean(req.user),
    tokenPresent: Boolean(token),
    tokenSource: bearer ? 'bearer' : cookieToken ? 'cookie' : 'none',
    sessionTrust: integrity.sessionTrust,
    tokenReason: integrity.reason,
    roleHydrated: roleState.valid,
    role: req.user?.role || 'UNKNOWN',
    roleReason: roleState.reason,
    userId: req.user?._id || null,
  });
};
