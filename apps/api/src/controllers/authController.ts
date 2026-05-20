import { Request, Response } from 'express';
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

export const register = async (req: Request, res: Response) => {
  const { password, name } = req.body;
  const email = normalizeEmail(req.body?.email);
  if (!email || !password || !name) return res.status(400).json({ error: 'Eksik bilgi' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, name, role: 'USER' });
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
  res.json({ id: user._id, email: user.email, name: user.name, role: user.role, token });
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
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Şifre hatalı' });
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
  const roleState = roleHydrationVerifier(user.role);
  if (!roleState.valid) return res.status(401).json({ error: 'Geçersiz rol durumu' });

  res.json({ id: user._id, email: user.email, name: user.name, role: roleState.normalizedRole, token });
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
