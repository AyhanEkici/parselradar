import mongoose, { Document, Schema } from 'mongoose';

export interface IPortfolio extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioSchema = new Schema<IPortfolio>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    currency: { type: String, default: 'TRY' },
  },
  { timestamps: true }
);

PortfolioSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
