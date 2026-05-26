import { Response } from 'express';
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { AuthRequest } from '../middleware/auth';
import { requireAuthUser } from '../utils/authUser';
import DocumentUpload from '../models/DocumentUpload';
import PropertySubmission from '../models/PropertySubmission';
import { logAuditEvent } from '../utils/auditLog';
import { propertyOwnerScope } from '../utils/scopeFilters';
import { uploadGovernanceEngine } from '../security/uploadGovernanceEngine';
import { maliciousUploadDetector } from '../security/maliciousUploadDetector';
import { downloadAccessAudit } from '../security/downloadAccessAudit';
import { buildEvidenceMetadataContract } from '../utils/evidenceMetadata';

const toGridFsUrls = (propertyId: string, documentId: string) => ({
  fileUrl: `/properties/${propertyId}/documents/${documentId}/view`,
  downloadUrl: `/properties/${propertyId}/documents/${documentId}/download`,
});

const getBucket = () => {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database connection not ready');
  return new GridFSBucket(db, { bucketName: 'documents' });
};

const canAccessProperty = async (user: AuthRequest['user'], propertyId: string) => {
  if (!user) return null;
  return PropertySubmission.findOne(propertyOwnerScope(user, { _id: propertyId }));
};

type MetadataStatus =
  | 'PREVIEW_ONLY'
  | 'NEEDS_REVIEW'
  | 'CONFIRMED_BY_USER'
  | 'CONFIRMED_BY_ADMIN'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'REJECTED';

const evidenceTypeAllowlist = new Set([
  'LISTING_SCREENSHOT',
  'TKGM_PARCEL_SCREENSHOT',
  'TKGM_ANALYSIS_SCREENSHOT',
  'TKGM_PRICE_HISTORY_SCREENSHOT',
  'TKGM_EXPORT_PDF',
  'TKGM_EXPORT_KML',
  'TKGM_EXPORT_GEOJSON',
  'TKGM_SCREENSHOT',
  'TKGM_EXPORT',
  'MUNICIPALITY_IMAR_DOCUMENT',
  'E_PLAN_DOCUMENT',
  'UCBP_TUCBS_EXPORT',
  'UCBP_TUCBS_SCREENSHOT',
  'MAP_LOCATION_CSV',
  'PHOTO',
  'OTHER',
]);

const sourceTypeAllowlist = new Set([
  'USER_SUBMITTED',
  'USER_PROVIDED_OFFICIAL_SOURCE_EVIDENCE',
  'TKGM_MANUAL_EVIDENCE',
  'TKGM_PUBLIC_PARCEL_SORGU_EVIDENCE',
  'TKGM_ANALYSIS_MARKET_SIGNAL',
  'MUNICIPALITY_IMAR_EVIDENCE',
  'E_PLAN_EVIDENCE',
  'UCBP_TUCBS_INFORMATIONAL_EVIDENCE',
  'LISTING_SOURCE',
  'ADMIN_MANUAL_OBSERVATION',
  'UNKNOWN',
]);

const statusAllowlist = new Set<MetadataStatus>([
  'PREVIEW_ONLY',
  'NEEDS_REVIEW',
  'CONFIRMED_BY_USER',
  'CONFIRMED_BY_ADMIN',
  'MANUAL_REVIEW_REQUIRED',
  'REJECTED',
]);
const previewFieldAllowlist = new Set(['title', 'longitude', 'latitude', '_id_', 'province', 'district', 'neighborhood', 'ada', 'parsel', 'price', 'm2']);

function normalizeAllowed(value: unknown, allowlist: Set<string>) {
  const normalized = String(value || '').trim();
  return allowlist.has(normalized) ? normalized : undefined;
}

function parseBoolean(value: unknown) {
  if (typeof value === 'boolean') return value;
  const normalized = String(value || '').toLowerCase().trim();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return undefined;
}

function parseJsonValue(value: unknown) {
  if (value == null) return { parsed: undefined as unknown, parseFailed: false };
  if (typeof value === 'object') return { parsed: value, parseFailed: false };
  if (typeof value !== 'string' || !value.trim()) return { parsed: undefined as unknown, parseFailed: false };
  try {
    return { parsed: JSON.parse(value), parseFailed: false };
  } catch {
    return { parsed: undefined as unknown, parseFailed: true };
  }
}

function sanitizeParsedPreview(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const source = value as Record<string, unknown>;
  const cleaned: Record<string, string> = {};
  for (const [key, raw] of Object.entries(source)) {
    if (!previewFieldAllowlist.has(key)) continue;
    const normalized = String(raw == null ? '' : raw).trim();
    if (!normalized) continue;
    cleaned[key] = normalized.slice(0, 240);
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

function sanitizeCsvDetectedFields(value: unknown) {
  const parsed = parseJsonValue(value);
  if (parsed.parseFailed) return { csvDetectedFields: undefined as string[] | undefined, parseFailed: true };
  if (!Array.isArray(parsed.parsed)) return { csvDetectedFields: undefined as string[] | undefined, parseFailed: false };
  const unique = Array.from(new Set(parsed.parsed.map((entry) => String(entry || '').trim()).filter((entry) => previewFieldAllowlist.has(entry))));
  return { csvDetectedFields: unique.length > 0 ? unique : undefined, parseFailed: false };
}

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  const requestId = req.requestId || '';
  try {
    const user = requireAuthUser(req);
    const { propertyId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: 'Geçersiz propertyId', requestId });
    }

    const property = await canAccessProperty(user, propertyId);
    if (!property) return res.status(404).json({ error: 'Mülk bulunamadı', requestId });
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Dosya gerekli', requestId });

    const requestBody = req.body as Record<string, unknown>;
    // Source evidence metadata
    const sourceKey = typeof requestBody.sourceKey === 'string' ? requestBody.sourceKey : undefined;
    const sourceTitle = typeof requestBody.sourceTitle === 'string' ? requestBody.sourceTitle : undefined;
    const uploadedFrom = typeof requestBody.uploadedFrom === 'string' ? requestBody.uploadedFrom : undefined;
    const officialVerification = requestBody.officialVerification === false ? false : undefined;

    const documentType = String(requestBody.documentType || '').trim();
    if (!documentType || !String(documentType).trim()) {
      return res.status(400).json({ error: 'Belge türü gerekli', requestId });
    }

    const evidenceType = normalizeAllowed(requestBody.evidenceType, evidenceTypeAllowlist);
    const sourceType = normalizeAllowed(requestBody.sourceType, sourceTypeAllowlist);
    const supportingEvidenceOnly = parseBoolean(requestBody.supportingEvidenceOnly);
    const reviewStatus = normalizeAllowed(requestBody.reviewStatus, statusAllowlist);

    const metadataStatusRaw = normalizeAllowed(requestBody.metadataStatus, statusAllowlist) as MetadataStatus | undefined;
    const parsedPreviewResult = parseJsonValue(requestBody.parsedPreview);
    const parsedPreview = sanitizeParsedPreview(parsedPreviewResult.parsed);
    const csvFieldsResult = sanitizeCsvDetectedFields(requestBody.csvDetectedFields);

    let metadataStatus: MetadataStatus = metadataStatusRaw || (parsedPreview ? 'PREVIEW_ONLY' : 'NEEDS_REVIEW');
    if (parsedPreviewResult.parseFailed || csvFieldsResult.parseFailed) {
      metadataStatus = 'MANUAL_REVIEW_REQUIRED';
    }
    const resolvedReviewStatus = (reviewStatus as MetadataStatus | undefined) || metadataStatus;

    const signature = file.buffer?.subarray(0, 4)?.toString('hex') || '';
    const malicious = maliciousUploadDetector({
      filename: file.originalname,
      mimeType: file.mimetype,
      byteSignature: signature,
    });
    const uploadPolicy = uploadGovernanceEngine({
      mimeType: file.mimetype,
      sizeBytes: file.size,
      extension: file.originalname.split('.').pop() || '',
      malwareSignals: malicious.suspicious ? 1 : 0,
    });
    if (uploadPolicy.blocked) {
      await logAuditEvent({
        type: 'upload_governance_blocked',
        actorUserId: user._id.toString(),
        actorRole: user.role,
        targetType: 'DocumentUpload',
        targetId: String(property._id),
        message: 'Upload blocked by governance policy',
        metadata: {
          filename: file.originalname,
          mimeType: file.mimetype,
          flags: malicious.flags,
        },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: false,
      });
      return res.status(400).json({ error: 'Dosya güvenlik politikası tarafından engellendi', requestId });
    }

    const existing = await DocumentUpload.findOne({
      propertySubmissionId: property._id,
      documentType,
      originalName: file.originalname,
      sizeBytes: file.size,
    });
    if (existing) {
      return res.status(409).json({ error: 'Document already uploaded', requestId });
    }

    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
      metadata: {
        propertySubmissionId: String(property._id),
        userId: String(user._id),
        documentType,
        evidenceType,
        sourceType,
        metadataStatus,
        reviewStatus: resolvedReviewStatus,
        supportingEvidenceOnly,
        sourceKey,
        sourceTitle,
        uploadedFrom,
        officialVerification,
      },
    });
    await new Promise<void>((resolve, reject) => {
      uploadStream.on('finish', () => resolve());
      uploadStream.on('error', reject);
      uploadStream.end(file.buffer);
    });

    const doc = await DocumentUpload.create({
      propertySubmissionId: property._id,
      userId: user._id,
      documentType,
      evidenceType,
      sourceType,
      reviewStatus: resolvedReviewStatus,
      metadataStatus,
      supportingEvidenceOnly,
      parsedPreview,
      csvDetectedFields: csvFieldsResult.csvDetectedFields,
      originalName: file.originalname,
      storedName: String(uploadStream.filename || file.originalname),
      gridFsFileId: uploadStream.id as mongoose.Types.ObjectId,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      sourceKey,
      sourceTitle,
      uploadedFrom,
      officialVerification,
    });
    const { fileUrl, downloadUrl } = toGridFsUrls(String(property._id), String(doc._id));
    const payload = {
      ...doc.toObject(),
      createdAt: doc.uploadedAt,
      storedName: doc.storedName,
      fileUrl,
      downloadUrl,
      fileMissing: false,
      evidenceMetadata: buildEvidenceMetadataContract({
        sourceType: doc.sourceType,
        reviewStatus: doc.reviewStatus,
        metadataStatus: doc.metadataStatus,
        evidenceType: doc.evidenceType,
        supportingEvidenceOnly: doc.supportingEvidenceOnly,
        uploadedAt: doc.uploadedAt,
      }),
    };
    res.json(payload);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Belge yükleme hatası', requestId });
  }
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const property = await canAccessProperty(user, req.params.propertyId);
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  const docs = await DocumentUpload.find({ propertySubmissionId: property._id }).sort({ uploadedAt: -1 });
  res.json(
    docs.map((doc) => {
      const hasGridFs = Boolean(doc.gridFsFileId);
      const urls = hasGridFs
        ? toGridFsUrls(String(property._id), String(doc._id))
        : { fileUrl: null, downloadUrl: null };
      return {
        ...doc.toObject(),
        storedName: doc.storedName,
        ...urls,
        fileMissing: !hasGridFs,
        createdAt: doc.uploadedAt,
        evidenceMetadata: buildEvidenceMetadataContract({
          sourceType: doc.sourceType,
          reviewStatus: doc.reviewStatus,
          metadataStatus: doc.metadataStatus,
          evidenceType: doc.evidenceType,
          supportingEvidenceOnly: doc.supportingEvidenceOnly,
          uploadedAt: doc.uploadedAt,
        }),
      };
    })
  );
};

export const viewDocument = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const { propertyId, documentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(propertyId) || !mongoose.Types.ObjectId.isValid(documentId)) {
    return res.status(400).json({ error: 'Geçersiz parametre' });
  }
  const property = await canAccessProperty(user, propertyId);
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  const doc = await DocumentUpload.findOne({ _id: documentId, propertySubmissionId: property._id });
  if (!doc) return res.status(404).json({ error: 'Belge bulunamadı' });
  if (!doc.gridFsFileId) return res.status(410).json({ error: 'Legacy file missing - re-upload required' });

  const accessAudit = downloadAccessAudit({
    userId: user._id.toString(),
    resourceType: 'DocumentUpload',
    resourceId: String(doc._id),
    allowed: true,
  });
  await logAuditEvent({
    type: 'document_view_access',
    actorUserId: user._id.toString(),
    actorRole: user.role,
    targetType: 'DocumentUpload',
    targetId: String(doc._id),
    message: 'Document inline view accessed',
    metadata: accessAudit,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    success: true,
  });

  const bucket = getBucket();
  const fileId = new ObjectId(String(doc.gridFsFileId));
  res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
  const isInline = (doc.mimeType || '').startsWith('image/') || doc.mimeType === 'application/pdf';
  const disposition = isInline ? 'inline' : 'attachment';
  res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(doc.originalName)}"`);

  const stream = bucket.openDownloadStream(fileId);
  stream.on('error', () => {
    if (!res.headersSent) res.status(404).json({ error: 'Dosya bulunamadı' });
  });
  stream.pipe(res);
};

export const downloadDocument = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const { propertyId, documentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(propertyId) || !mongoose.Types.ObjectId.isValid(documentId)) {
    return res.status(400).json({ error: 'Geçersiz parametre' });
  }
  const property = await canAccessProperty(user, propertyId);
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  const doc = await DocumentUpload.findOne({ _id: documentId, propertySubmissionId: property._id });
  if (!doc) return res.status(404).json({ error: 'Belge bulunamadı' });
  if (!doc.gridFsFileId) return res.status(410).json({ error: 'Legacy file missing - re-upload required' });

  const accessAudit = downloadAccessAudit({
    userId: user._id.toString(),
    resourceType: 'DocumentUpload',
    resourceId: String(doc._id),
    allowed: true,
  });
  await logAuditEvent({
    type: 'document_download_access',
    actorUserId: user._id.toString(),
    actorRole: user.role,
    targetType: 'DocumentUpload',
    targetId: String(doc._id),
    message: 'Document download accessed',
    metadata: accessAudit,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    success: true,
  });

  const bucket = getBucket();
  const fileId = new ObjectId(String(doc.gridFsFileId));
  res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.originalName)}"`);

  const stream = bucket.openDownloadStream(fileId);
  stream.on('error', () => {
    if (!res.headersSent) res.status(404).json({ error: 'Dosya bulunamadı' });
  });
  stream.pipe(res);
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const requestId = req.requestId || '';
  const { propertyId, documentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(propertyId) || !mongoose.Types.ObjectId.isValid(documentId)) {
    return res.status(400).json({ error: 'Geçersiz parametre', requestId });
  }

  const property = await canAccessProperty(user, propertyId);
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı', requestId });

  const doc = await DocumentUpload.findOne({ _id: documentId, propertySubmissionId: property._id });
  if (!doc) return res.status(404).json({ error: 'Belge bulunamadı', requestId });

  if (doc.gridFsFileId) {
    try {
      const bucket = getBucket();
      await bucket.delete(new ObjectId(String(doc.gridFsFileId)));
    } catch {
      // Ignore missing GridFS file and continue metadata cleanup.
    }
  }

  await DocumentUpload.deleteOne({ _id: doc._id });

  await logAuditEvent({
    type: 'document_deleted',
    actorUserId: user._id.toString(),
    actorRole: user.role,
    targetType: 'DocumentUpload',
    targetId: doc._id.toString(),
    message: 'Document deleted',
    metadata: {
      propertyId: String(property._id),
      documentType: doc.documentType,
      originalName: doc.originalName,
      hadGridFs: Boolean(doc.gridFsFileId),
    },
    ip: req.ip,
    userAgent: req.get('user-agent'),
    success: true,
  });

  return res.json({ ok: true, requestId });
};
