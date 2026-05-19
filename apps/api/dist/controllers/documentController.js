"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.downloadDocument = exports.viewDocument = exports.getDocuments = exports.uploadDocument = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_1 = require("mongodb");
const authUser_1 = require("../utils/authUser");
const DocumentUpload_1 = __importDefault(require("../models/DocumentUpload"));
const PropertySubmission_1 = __importDefault(require("../models/PropertySubmission"));
const auditLog_1 = require("../utils/auditLog");
const scopeFilters_1 = require("../utils/scopeFilters");
const toGridFsUrls = (propertyId, documentId) => ({
    fileUrl: `/properties/${propertyId}/documents/${documentId}/view`,
    downloadUrl: `/properties/${propertyId}/documents/${documentId}/download`,
});
const getBucket = () => {
    const db = mongoose_1.default.connection.db;
    if (!db)
        throw new Error('Database connection not ready');
    return new mongodb_1.GridFSBucket(db, { bucketName: 'documents' });
};
const canAccessProperty = async (user, propertyId) => {
    if (!user)
        return null;
    return PropertySubmission_1.default.findOne((0, scopeFilters_1.propertyOwnerScope)(user, { _id: propertyId }));
};
const uploadDocument = async (req, res) => {
    const requestId = req.requestId || '';
    try {
        const user = (0, authUser_1.requireAuthUser)(req);
        const { propertyId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(propertyId)) {
            return res.status(400).json({ error: 'Geçersiz propertyId', requestId });
        }
        const property = await canAccessProperty(user, propertyId);
        if (!property)
            return res.status(404).json({ error: 'Mülk bulunamadı', requestId });
        const file = req.file;
        if (!file)
            return res.status(400).json({ error: 'Dosya gerekli', requestId });
        const { documentType } = req.body;
        if (!documentType || !String(documentType).trim()) {
            return res.status(400).json({ error: 'Belge türü gerekli', requestId });
        }
        const existing = await DocumentUpload_1.default.findOne({
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
            },
        });
        await new Promise((resolve, reject) => {
            uploadStream.on('finish', () => resolve());
            uploadStream.on('error', reject);
            uploadStream.end(file.buffer);
        });
        const doc = await DocumentUpload_1.default.create({
            propertySubmissionId: property._id,
            userId: user._id,
            documentType,
            originalName: file.originalname,
            storedName: String(uploadStream.filename || file.originalname),
            gridFsFileId: uploadStream.id,
            mimeType: file.mimetype,
            sizeBytes: file.size,
        });
        const { fileUrl, downloadUrl } = toGridFsUrls(String(property._id), String(doc._id));
        const payload = {
            ...doc.toObject(),
            createdAt: doc.uploadedAt,
            storedName: doc.storedName,
            fileUrl,
            downloadUrl,
            fileMissing: false,
        };
        res.json(payload);
    }
    catch (err) {
        return res.status(500).json({ error: err?.message || 'Belge yükleme hatası', requestId });
    }
};
exports.uploadDocument = uploadDocument;
const getDocuments = async (req, res) => {
    const user = (0, authUser_1.requireAuthUser)(req);
    const property = await canAccessProperty(user, req.params.propertyId);
    if (!property)
        return res.status(404).json({ error: 'Mülk bulunamadı' });
    const docs = await DocumentUpload_1.default.find({ propertySubmissionId: property._id }).sort({ uploadedAt: -1 });
    res.json(docs.map((doc) => {
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
        };
    }));
};
exports.getDocuments = getDocuments;
const viewDocument = async (req, res) => {
    const user = (0, authUser_1.requireAuthUser)(req);
    const { propertyId, documentId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(propertyId) || !mongoose_1.default.Types.ObjectId.isValid(documentId)) {
        return res.status(400).json({ error: 'Geçersiz parametre' });
    }
    const property = await canAccessProperty(user, propertyId);
    if (!property)
        return res.status(404).json({ error: 'Mülk bulunamadı' });
    const doc = await DocumentUpload_1.default.findOne({ _id: documentId, propertySubmissionId: property._id });
    if (!doc)
        return res.status(404).json({ error: 'Belge bulunamadı' });
    if (!doc.gridFsFileId)
        return res.status(410).json({ error: 'Legacy file missing - re-upload required' });
    const bucket = getBucket();
    const fileId = new mongodb_1.ObjectId(String(doc.gridFsFileId));
    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
    const isInline = (doc.mimeType || '').startsWith('image/') || doc.mimeType === 'application/pdf';
    const disposition = isInline ? 'inline' : 'attachment';
    res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(doc.originalName)}"`);
    const stream = bucket.openDownloadStream(fileId);
    stream.on('error', () => {
        if (!res.headersSent)
            res.status(404).json({ error: 'Dosya bulunamadı' });
    });
    stream.pipe(res);
};
exports.viewDocument = viewDocument;
const downloadDocument = async (req, res) => {
    const user = (0, authUser_1.requireAuthUser)(req);
    const { propertyId, documentId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(propertyId) || !mongoose_1.default.Types.ObjectId.isValid(documentId)) {
        return res.status(400).json({ error: 'Geçersiz parametre' });
    }
    const property = await canAccessProperty(user, propertyId);
    if (!property)
        return res.status(404).json({ error: 'Mülk bulunamadı' });
    const doc = await DocumentUpload_1.default.findOne({ _id: documentId, propertySubmissionId: property._id });
    if (!doc)
        return res.status(404).json({ error: 'Belge bulunamadı' });
    if (!doc.gridFsFileId)
        return res.status(410).json({ error: 'Legacy file missing - re-upload required' });
    const bucket = getBucket();
    const fileId = new mongodb_1.ObjectId(String(doc.gridFsFileId));
    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.originalName)}"`);
    const stream = bucket.openDownloadStream(fileId);
    stream.on('error', () => {
        if (!res.headersSent)
            res.status(404).json({ error: 'Dosya bulunamadı' });
    });
    stream.pipe(res);
};
exports.downloadDocument = downloadDocument;
const deleteDocument = async (req, res) => {
    const user = (0, authUser_1.requireAuthUser)(req);
    const requestId = req.requestId || '';
    const { propertyId, documentId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(propertyId) || !mongoose_1.default.Types.ObjectId.isValid(documentId)) {
        return res.status(400).json({ error: 'Geçersiz parametre', requestId });
    }
    const property = await canAccessProperty(user, propertyId);
    if (!property)
        return res.status(404).json({ error: 'Mülk bulunamadı', requestId });
    const doc = await DocumentUpload_1.default.findOne({ _id: documentId, propertySubmissionId: property._id });
    if (!doc)
        return res.status(404).json({ error: 'Belge bulunamadı', requestId });
    if (doc.gridFsFileId) {
        try {
            const bucket = getBucket();
            await bucket.delete(new mongodb_1.ObjectId(String(doc.gridFsFileId)));
        }
        catch {
            // Ignore missing GridFS file and continue metadata cleanup.
        }
    }
    await DocumentUpload_1.default.deleteOne({ _id: doc._id });
    await (0, auditLog_1.logAuditEvent)({
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
exports.deleteDocument = deleteDocument;
