import mongoose, { Document, Schema } from 'mongoose';

export interface ISharedAnalysis extends Document {
  organizationId: mongoose.Types.ObjectId;
  propertySubmissionId: mongoose.Types.ObjectId;
  analysisRunId: mongoose.Types.ObjectId;
  sharedByUserId: mongoose.Types.ObjectId;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SharedAnalysisSchema = new Schema<ISharedAnalysis>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    propertySubmissionId: { type: Schema.Types.ObjectId, ref: 'PropertySubmission', required: true, index: true },
    analysisRunId: { type: Schema.Types.ObjectId, ref: 'AnalysisRun', required: true, index: true },
    sharedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    comment: { type: String },
  },
  { timestamps: true }
);

SharedAnalysisSchema.index({ organizationId: 1, propertySubmissionId: 1, analysisRunId: 1 }, { unique: true });

export default mongoose.model<ISharedAnalysis>('SharedAnalysis', SharedAnalysisSchema);
