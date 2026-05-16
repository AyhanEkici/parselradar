import { Response } from 'express';
import { logAuditEvent } from '../utils/auditLog';
import { AuthRequest } from '../middleware/auth';
import { requireAuthUser } from '../utils/authUser';
import PropertySubmission from '../models/PropertySubmission';
import { PropertySubmissionCreateInputSchema } from '../validation/propertySchemas';

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const user = requireAuthUser(req);
    const parsed = PropertySubmissionCreateInputSchema.safeParse(req.body);
    if (!parsed.success) {
      await logAuditEvent({
        type: 'property_create',
        actorUserId: user._id.toString(),
        actorRole: user.role,
        targetType: 'User',
        targetId: user._id.toString(),
        message: 'Property create failed: invalid data',
        metadata: { errors: parsed.error.errors },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: false,
      });
      return res.status(400).json({ error: 'Geçersiz veri', details: parsed.error.errors });
    }
    const input = parsed.data;
    const doc: Record<string, unknown> = { ...input, userId: user._id };
    if (input.askingPriceTRY && input.areaM2 && input.areaM2 > 0) {
      doc.pricePerM2 = input.askingPriceTRY / input.areaM2;
    }
    // createdAt/updatedAt handled by Mongoose timestamps
    const property = await PropertySubmission.create(doc);
    await logAuditEvent({
      type: 'property_create',
      actorUserId: user._id.toString(),
      actorRole: user.role,
      targetType: 'PropertySubmission',
      targetId: property._id.toString(),
      message: 'Property created',
      metadata: { propertyId: property._id.toString() },
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
    });
    res.json(property);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      await logAuditEvent({
        type: 'property_create',
        actorUserId: undefined,
        actorRole: undefined,
        targetType: 'PropertySubmission',
        targetId: undefined,
        message: 'Property create failed: mongoose validation',
        metadata: { error: err.errors },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: false,
      });
      return res.status(400).json({ error: 'Mongoose validation error', details: err.errors });
    }
    console.error('Property creation error:', err);
    await logAuditEvent({
      type: 'property_create',
      actorUserId: undefined,
      actorRole: undefined,
      targetType: 'PropertySubmission',
      targetId: undefined,
      message: 'Property create failed: server error',
      metadata: { error: err.message },
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: false,
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyProperties = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const properties = await PropertySubmission.find({ userId: user._id }).sort({ createdAt: -1 });
  res.json(properties);
};
