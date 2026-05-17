import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalysisExport extends Document {
  userId: mongoose.Types.ObjectId;
  propertySubmissionId: mongoose.Types.ObjectId;
  analysisRunId?: mongoose.Types.ObjectId;
  format: 'json';
  payload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AnalysisExportSchema = new Schema<IAnalysisExport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    propertySubmissionId: { type: Schema.Types.ObjectId, ref: 'PropertySubmission', required: true, index: true },
    analysisRunId: { type: Schema.Types.ObjectId, ref: 'AnalysisRun' },
    format: { type: String, enum: ['json'], default: 'json', required: true },
    payload: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAnalysisExport>('AnalysisExport', AnalysisExportSchema);
