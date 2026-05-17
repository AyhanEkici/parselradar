import mongoose, { Schema, Document } from 'mongoose';

/**
 * Records activation and deactivation events for a connector.
 * One record per activation/deactivation action (append-only audit log).
 */
export interface IConnectorActivationRecord extends Document {
  connectorKey: string;
  state: 'ACTIVE' | 'DISABLED';
  activatedAt?: Date;
  activatedByUserId?: string;
  deactivatedAt?: Date;
  deactivatedByUserId?: string;
  testRunId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectorActivationRecordSchema = new Schema<IConnectorActivationRecord>(
  {
    connectorKey: { type: String, required: true, index: true },
    state: { type: String, enum: ['ACTIVE', 'DISABLED'], required: true },
    activatedAt: { type: Date },
    activatedByUserId: { type: String },
    deactivatedAt: { type: Date },
    deactivatedByUserId: { type: String },
    testRunId: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<IConnectorActivationRecord>(
  'ConnectorActivationRecord',
  ConnectorActivationRecordSchema,
);
