import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  propertySubmissionId: mongoose.Types.ObjectId;
  analysisRunId: mongoose.Types.ObjectId;
  title?: string;
  summary?: string;
  score?: number;
  signal?: string;
  confidence?: number;
  sourceConfidence?: string;
  freshnessScore?: number;
  analysisVersion?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavedAnalysisSchema = new Schema<ISavedAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    propertySubmissionId: { type: Schema.Types.ObjectId, ref: 'PropertySubmission', required: true, index: true },
    analysisRunId: { type: Schema.Types.ObjectId, ref: 'AnalysisRun', required: true },
    title: { type: String },
    summary: { type: String },
    score: { type: Number },
    signal: { type: String },
    confidence: { type: Number },
    sourceConfidence: { type: String },
    freshnessScore: { type: Number },
    analysisVersion: { type: String },
  },
  { timestamps: true }
);

SavedAnalysisSchema.index({ userId: 1, propertySubmissionId: 1, analysisRunId: 1 }, { unique: true });

export default mongoose.model<ISavedAnalysis>('SavedAnalysis', SavedAnalysisSchema);
