import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentUpload extends Document {
  propertySubmissionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  documentType: string;
  evidenceType?: string;
  sourceType?: string;
  reviewStatus?: string;
  metadataStatus?: 'PREVIEW_ONLY' | 'NEEDS_REVIEW' | 'CONFIRMED_BY_USER' | 'MANUAL_REVIEW_REQUIRED';
  supportingEvidenceOnly?: boolean;
  parsedPreview?: Record<string, string>;
  csvDetectedFields?: string[];
  originalName: string;
  storedName?: string;
  storedPath?: string;
  gridFsFileId?: mongoose.Types.ObjectId;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: Date;
}

const DocumentUploadSchema = new Schema<IDocumentUpload>({
  propertySubmissionId: { type: Schema.Types.ObjectId, ref: 'PropertySubmission', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  documentType: { type: String, required: true },
  evidenceType: { type: String },
  sourceType: { type: String },
  reviewStatus: { type: String },
  metadataStatus: { type: String, enum: ['PREVIEW_ONLY', 'NEEDS_REVIEW', 'CONFIRMED_BY_USER', 'MANUAL_REVIEW_REQUIRED'] },
  supportingEvidenceOnly: { type: Boolean },
  parsedPreview: { type: Schema.Types.Mixed },
  csvDetectedFields: [{ type: String }],
  originalName: { type: String, required: true },
  storedName: { type: String },
  storedPath: { type: String },
  gridFsFileId: { type: Schema.Types.ObjectId },
  mimeType: { type: String, required: true },
  sizeBytes: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IDocumentUpload>('DocumentUpload', DocumentUploadSchema);
