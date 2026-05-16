import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { logAuditEvent } from '../utils/auditLog';
import { JWT_SECRET } from '../config/env';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
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
  res.json({ id: user._id, email: user.email, name: user.name, role: user.role });
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
  const { email, password } = req.body;
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
  res.json({ id: user._id, email: user.email, name: user.name, role: user.role });
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
