import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { requireAuthUser } from '../utils/authUser';
import PropertySubmission from '../models/PropertySubmission';
import { PropertySubmissionSchema } from '@parselradar/shared';

export const createProperty = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const parsed = PropertySubmissionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Geçersiz veri', details: parsed.error.errors });
  const data = parsed.data;
  data.userId = user._id;
  if (data.askingPriceTRY && data.areaM2) data.pricePerM2 = data.askingPriceTRY / data.areaM2;
  const property = await PropertySubmission.create(data);
  res.json(property);
};

export const getProperties = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const properties = await PropertySubmission.find({ userId: user._id });
  res.json(properties);
};

export const getProperty = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const property = await PropertySubmission.findOne({ _id: req.params.id, userId: user._id });
  if (!property) return res.status(404).json({ error: 'Bulunamadı' });
  res.json(property);
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const property = await PropertySubmission.findOne({ _id: req.params.id, userId: user._id });
  if (!property) return res.status(404).json({ error: 'Bulunamadı' });
  const parsed = PropertySubmissionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Geçersiz veri', details: parsed.error.errors });
  Object.assign(property, parsed.data);
  if (property.askingPriceTRY && property.areaM2) property.pricePerM2 = property.askingPriceTRY / property.areaM2;
  await property.save();
  res.json(property);
};
