import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspaceActivity extends Document {
  organizationId: mongoose.Types.ObjectId;
  actorUserId: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceActivitySchema = new Schema<IWorkspaceActivity>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    actorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

WorkspaceActivitySchema.index({ organizationId: 1, createdAt: -1 });

export default mongoose.model<IWorkspaceActivity>('WorkspaceActivity', WorkspaceActivitySchema);
