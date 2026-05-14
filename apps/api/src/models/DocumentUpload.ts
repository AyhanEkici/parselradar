import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentUpload extends Document {
  propertySubmissionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  documentType: string;
  originalName: string;
  storedPath: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: Date;
}

const DocumentUploadSchema = new Schema<IDocumentUpload>({
  propertySubmissionId: { type: Schema.Types.ObjectId, ref: 'PropertySubmission', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  documentType: { type: String, required: true },
  originalName: { type: String, required: true },
  storedPath: { type: String, required: true },
  mimeType: { type: String, required: true },
  sizeBytes: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IDocumentUpload>('DocumentUpload', DocumentUploadSchema);
