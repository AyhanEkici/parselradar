import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { NODE_ENV } from '../config/env';
import CreditLedger from '../models/CreditLedger';
import { getUserCredits } from '../utils/credits';
import { requireAuthUser } from '../utils/authUser';

export const getCredits = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const credits = await getUserCredits(user._id);
  res.json({ credits });
};

export const devAddCredits = async (req: AuthRequest, res: Response) => {
  if (NODE_ENV === 'production') return res.status(403).json({ error: 'Prod ortamda dev kredi eklenemez' });
  const user = requireAuthUser(req);
  const { amount } = req.body;
  if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ error: 'Geçersiz miktar' });
  await CreditLedger.create({ userId: user._id, type: 'DEV_ADD', amount, reason: 'Dev ekleme' });
  res.json({ ok: true });
};
