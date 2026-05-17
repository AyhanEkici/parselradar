import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspace extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  createdByUserId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, default: 'Main Workspace' },
    description: { type: String },
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

WorkspaceSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export default mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
