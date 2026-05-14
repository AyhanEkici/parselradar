import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { requireAuthUser } from '../utils/authUser';
import PropertySubmission from '../models/PropertySubmission';

import { PropertySubmissionCreateInputSchema } from '../validation/propertySchemas';

export const createProperty = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const parsed = PropertySubmissionCreateInputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Geçersiz veri', details: parsed.error.errors });
  const input = parsed.data;
  const doc: Record<string, unknown> = { ...input, userId: user._id };
  if (input.askingPriceTRY && input.areaM2 && input.areaM2 > 0) {
    doc.pricePerM2 = input.askingPriceTRY / input.areaM2;
  }
  // createdAt/updatedAt handled by Mongoose timestamps
  const property = await PropertySubmission.create(doc);
  res.json(property);
};

export const getProperties = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const properties = await PropertySubmission.find({ userId: user._id });
  res.json(properties);
};
