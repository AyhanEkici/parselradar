import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  analysisRunId: mongoose.Types.ObjectId;
  propertySubmissionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  reportType: string;
  pdfPath: string;
  creditsCharged: number;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>({
  analysisRunId: { type: Schema.Types.ObjectId, ref: 'AnalysisRun', required: true },
  propertySubmissionId: { type: Schema.Types.ObjectId, ref: 'PropertySubmission', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportType: { type: String, required: true },
  pdfPath: { type: String, required: true },
  creditsCharged: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IReport>('Report', ReportSchema);
