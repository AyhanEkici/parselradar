import mongoose, { Document, Schema } from 'mongoose';

export type OrganizationRole = 'OWNER' | 'ADMIN' | 'ANALYST' | 'VIEWER';

export interface IOrganizationMember extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: OrganizationRole;
  status: 'ACTIVE' | 'INACTIVE';
  invitedByUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationMemberSchema = new Schema<IOrganizationMember>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['OWNER', 'ADMIN', 'ANALYST', 'VIEWER'], required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    invitedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

OrganizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IOrganizationMember>('OrganizationMember', OrganizationMemberSchema);
