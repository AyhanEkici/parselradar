import mongoose, { Schema, Document } from 'mongoose';

/**
 * Records legal/source approval for a connector.
 * Each connector has at most one approval record (upserted on each approval action).
 */
export interface IConnectorSourceApproval extends Document {
  connectorKey: string;
  approved: boolean;
  approvedByUserId?: string;
  approvedAt?: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectorSourceApprovalSchema = new Schema<IConnectorSourceApproval>(
  {
    connectorKey: { type: String, required: true, unique: true, index: true },
    approved: { type: Boolean, required: true, default: false },
    approvedByUserId: { type: String },
    approvedAt: { type: Date },
    note: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<IConnectorSourceApproval>(
  'ConnectorSourceApproval',
  ConnectorSourceApprovalSchema,
);
