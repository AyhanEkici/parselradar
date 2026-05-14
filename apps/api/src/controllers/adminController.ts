import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { requireAuthUser } from '../utils/authUser';
import PropertySubmission from '../models/PropertySubmission';
import DealPoolEntry from '../models/DealPoolEntry';
import DealShareAudit from '../models/DealShareAudit';
import ConsentRecord from '../models/ConsentRecord';

export const getAllProperties = async (req: AuthRequest, res: Response) => {
  const properties = await PropertySubmission.find();
  res.json(properties);
};

export const getPropertyById = async (req: AuthRequest, res: Response) => {
  const property = await PropertySubmission.findById(req.params.id);
  if (!property) return res.status(404).json({ error: 'Bulunamadı' });
  res.json(property);
};

export const reviewProperty = async (req: AuthRequest, res: Response) => {
  const property = await PropertySubmission.findById(req.params.id);
  if (!property) return res.status(404).json({ error: 'Bulunamadı' });
  Object.assign(property, req.body);
  await property.save();
  res.json(property);
};

export const acceptDealPool = async (req: AuthRequest, res: Response) => {
  const property = await PropertySubmission.findById(req.params.propertyId);
  if (!property) return res.status(404).json({ error: 'Bulunamadı' });
  const consent = await ConsentRecord.findOne({ propertySubmissionId: property._id });
  if (!consent?.allowDealPoolEvaluation || !consent?.allowContactForMatching) return res.status(400).json({ error: 'Deal Pool izni yok' });
  const entry = await DealPoolEntry.create({ propertySubmissionId: property._id, userId: property.userId, status: 'ACCEPTED', matchCategories: [] });
  res.json(entry);
};

export const shareDealPool = async (req: AuthRequest, res: Response) => {
  const entry = await DealPoolEntry.findById(req.params.entryId);
  if (!entry) return res.status(404).json({ error: 'Deal Pool girişi bulunamadı' });
  // Consent check and audit
  const consent = await ConsentRecord.findOne({ propertySubmissionId: entry.propertySubmissionId });
  if (!consent?.allowDealPoolEvaluation || !consent?.allowContactForMatching) return res.status(400).json({ error: 'Paylaşım izni yok' });
  const adminUser = requireAuthUser(req);
  await DealShareAudit.create({ dealPoolEntryId: entry._id, sharedWithType: req.body.sharedWithType, sharedWithName: req.body.sharedWithName, sharedWithContact: req.body.sharedWithContact, sharedFields: req.body.sharedFields, adminUserId: adminUser._id });
  res.json({ ok: true });
};
