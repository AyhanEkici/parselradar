import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { requireAuthUser } from '../utils/authUser';
import DocumentUpload from '../models/DocumentUpload';
import PropertySubmission from '../models/PropertySubmission';

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const property = await PropertySubmission.findOne({ _id: req.params.propertyId, userId: user._id });
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  if (!req.file) return res.status(400).json({ error: 'Dosya gerekli' });
  const { documentType } = req.body;
  if (!documentType) return res.status(400).json({ error: 'Belge türü gerekli' });
  const doc = await DocumentUpload.create({
    propertySubmissionId: property._id,
    userId: user._id,
    documentType,
    originalName: req.file.originalname,
    storedPath: req.file.path,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
  });
  res.json(doc);
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const property = await PropertySubmission.findOne({ _id: req.params.propertyId, userId: user._id });
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  const docs = await DocumentUpload.find({ propertySubmissionId: property._id });
  res.json(docs);
};
