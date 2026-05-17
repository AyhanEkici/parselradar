import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspaceWatchlist extends Document {
  organizationId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  propertySubmissionId: mongoose.Types.ObjectId;
  addedByUserId: mongoose.Types.ObjectId;
  note?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceWatchlistSchema = new Schema<IWorkspaceWatchlist>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', index: true },
    propertySubmissionId: { type: Schema.Types.ObjectId, ref: 'PropertySubmission', required: true, index: true },
    addedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    note: { type: String },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

WorkspaceWatchlistSchema.index({ organizationId: 1, propertySubmissionId: 1 }, { unique: true });

export default mongoose.model<IWorkspaceWatchlist>('WorkspaceWatchlist', WorkspaceWatchlistSchema);
