import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  createdByUserId: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

OrganizationSchema.index({ createdByUserId: 1, createdAt: -1 });

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);
