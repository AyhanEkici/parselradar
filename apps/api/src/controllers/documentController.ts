import { Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { AuthRequest } from '../middleware/auth';
import { requireAuthUser } from '../utils/authUser';
import DocumentUpload from '../models/DocumentUpload';
import PropertySubmission from '../models/PropertySubmission';

const toStoredName = (storedPath?: string, storedName?: string) => {
  if (storedName && String(storedName).trim()) return String(storedName).trim();
  if (!storedPath || !String(storedPath).trim()) return null;
  const normalized = String(storedPath).replace(/\\/g, '/');
  const name = path.posix.basename(normalized);
  if (!name || name === '/' || name === '.') return null;
  return name;
};

const toPublicFileUrl = (storedPath?: string, storedName?: string) => {
  const name = toStoredName(storedPath, storedName);
  if (!name) return null;
  return `/uploads/${encodeURIComponent(name)}`;
};

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  const requestId = req.requestId || '';
  try {
    const user = requireAuthUser(req);
    const { propertyId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: 'Geçersiz propertyId', requestId });
    }

    const property = await PropertySubmission.findOne({ _id: propertyId, userId: user._id });
    if (!property) return res.status(404).json({ error: 'Mülk bulunamadı', requestId });
    if (!req.file) return res.status(400).json({ error: 'Dosya gerekli', requestId });

    const { documentType } = req.body as { documentType?: string };
    if (!documentType || !String(documentType).trim()) {
      return res.status(400).json({ error: 'Belge türü gerekli', requestId });
    }

    const existing = await DocumentUpload.findOne({
      propertySubmissionId: property._id,
      documentType,
      originalName: req.file.originalname,
      sizeBytes: req.file.size,
    });
    if (existing) {
      return res.status(409).json({ error: 'Document already uploaded', requestId });
    }

    const doc = await DocumentUpload.create({
      propertySubmissionId: property._id,
      userId: user._id,
      documentType,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      storedPath: req.file.path,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    });
    const fileUrl = toPublicFileUrl(doc.storedPath, doc.storedName);
    const payload = {
      ...doc.toObject(),
      createdAt: doc.uploadedAt,
      storedName: toStoredName(doc.storedPath, doc.storedName),
      fileUrl,
      downloadUrl: fileUrl,
    };
    res.json(payload);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Belge yükleme hatası', requestId });
  }
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const property = await PropertySubmission.findOne({ _id: req.params.propertyId, userId: user._id });
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  const docs = await DocumentUpload.find({ propertySubmissionId: property._id }).sort({ uploadedAt: -1 });
  res.json(
    docs.map((doc) => ({
      ...doc.toObject(),
      storedName: toStoredName(doc.storedPath, doc.storedName),
      fileUrl: toPublicFileUrl(doc.storedPath, doc.storedName),
      downloadUrl: toPublicFileUrl(doc.storedPath, doc.storedName),
      fileMissing: !toPublicFileUrl(doc.storedPath, doc.storedName),
      createdAt: doc.uploadedAt,
    }))
  );
};
