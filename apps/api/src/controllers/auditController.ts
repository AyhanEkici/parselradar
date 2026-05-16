import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import AuditEvent from '../models/AuditEvent';

export const getAuditEvents = async (req: AuthRequest, res: Response) => {
  // Only admin middleware should allow this
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 25);
  const filter: any = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.actorUserId) filter.actorUserId = req.query.actorUserId;
  const events = await AuditEvent.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await AuditEvent.countDocuments(filter);
  res.json({
    events,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
};
