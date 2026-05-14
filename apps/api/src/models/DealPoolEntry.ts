import mongoose, { Schema, Document } from 'mongoose';

export interface IDealPoolEntry extends Document {
  propertySubmissionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: string;
  matchCategories: string[];
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DealPoolEntrySchema = new Schema<IDealPoolEntry>({
  propertySubmissionId: { type: Schema.Types.ObjectId, ref: 'PropertySubmission', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, required: true },
  matchCategories: { type: [String], required: true },
  adminNotes: { type: String },
}, { timestamps: true });

export default mongoose.model<IDealPoolEntry>('DealPoolEntry', DealPoolEntrySchema);
