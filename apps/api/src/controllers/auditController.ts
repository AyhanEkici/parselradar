import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import AuditEvent from '../models/AuditEvent';

export const getAuditEvents = async (req: AuthRequest, res: Response) => {
  // Only admin middleware should allow this
  const events = await AuditEvent.find().sort({ createdAt: -1 }).limit(100);
  res.json(events);
};
