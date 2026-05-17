import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspacePortfolio extends Document {
  organizationId: mongoose.Types.ObjectId;
  workspaceId?: mongoose.Types.ObjectId;
  title: string;
  propertySubmissionId: mongoose.Types.ObjectId;
  addedByUserId: mongoose.Types.ObjectId;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspacePortfolioSchema = new Schema<IWorkspacePortfolio>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', index: true },
    title: { type: String, default: 'Shared Portfolio' },
    propertySubmissionId: { type: Schema.Types.ObjectId, ref: 'PropertySubmission', required: true, index: true },
    addedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    note: { type: String },
  },
  { timestamps: true }
);

WorkspacePortfolioSchema.index({ organizationId: 1, title: 1, propertySubmissionId: 1 }, { unique: true });

export default mongoose.model<IWorkspacePortfolio>('WorkspacePortfolio', WorkspacePortfolioSchema);
