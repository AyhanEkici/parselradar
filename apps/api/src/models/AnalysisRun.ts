
import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalysisRun extends Document {
  propertySubmissionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  productType: string;
  score: number;
  signal: string;
  riskFlags: string[];
  missingInfo: string[];
  assumptions: string[];
  unverifiableInfo: string[];
  previewSummary: Record<string, unknown>;
  fullAnalysis: Record<string, unknown>;
  createdAt: Date;
}

const AnalysisRunSchema = new Schema<IAnalysisRun>({
  propertySubmissionId: { type: Schema.Types.ObjectId, ref: 'PropertySubmission', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productType: { type: String, required: true },
  score: { type: Number, required: true },
  signal: { type: String, required: true },
  riskFlags: { type: [String], required: true },
  missingInfo: { type: [String], required: true },
  assumptions: { type: [String], required: true },
  unverifiableInfo: { type: [String], required: true },
  previewSummary: { type: Schema.Types.Mixed, required: true },
  fullAnalysis: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAnalysisRun>('AnalysisRun', AnalysisRunSchema);
