import mongoose, { Document, Schema } from 'mongoose';

export interface IWatchlist extends Document {
  userId: mongoose.Types.ObjectId;
  propertySubmissionId: mongoose.Types.ObjectId;
  note?: string;
  status?: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

const WatchlistSchema = new Schema<IWatchlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    propertySubmissionId: { type: Schema.Types.ObjectId, ref: 'PropertySubmission', required: true, index: true },
    note: { type: String },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

WatchlistSchema.index({ userId: 1, propertySubmissionId: 1 }, { unique: true });

export default mongoose.model<IWatchlist>('Watchlist', WatchlistSchema);
