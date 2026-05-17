import mongoose, { Document, Schema } from 'mongoose';

export interface IPortfolioItem extends Document {
  userId: mongoose.Types.ObjectId;
  portfolioId: mongoose.Types.ObjectId;
  propertySubmissionId: mongoose.Types.ObjectId;
  allocationWeight?: number;
  thesis?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioItemSchema = new Schema<IPortfolioItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    portfolioId: { type: Schema.Types.ObjectId, ref: 'Portfolio', required: true, index: true },
    propertySubmissionId: { type: Schema.Types.ObjectId, ref: 'PropertySubmission', required: true, index: true },
    allocationWeight: { type: Number, min: 0, max: 100, default: 0 },
    thesis: { type: String },
  },
  { timestamps: true }
);

PortfolioItemSchema.index({ userId: 1, portfolioId: 1, propertySubmissionId: 1 }, { unique: true });

export default mongoose.model<IPortfolioItem>('PortfolioItem', PortfolioItemSchema);
