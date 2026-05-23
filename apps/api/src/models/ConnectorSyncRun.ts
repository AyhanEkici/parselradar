import mongoose, { Document, Schema } from 'mongoose';

export interface IConnectorSyncRun extends Document {
  connectorKey: string;
  sourceName: string;
  sourceUrl: string;
  triggerMode: 'MANUAL' | 'SCHEDULED';
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'SKIPPED';
  startedAt: Date;
  finishedAt: Date;
  error?: string;
  responseSummary?: Record<string, unknown>;
  runByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectorSyncRunSchema = new Schema<IConnectorSyncRun>(
  {
    connectorKey: { type: String, required: true, index: true },
    sourceName: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    triggerMode: { type: String, enum: ['MANUAL', 'SCHEDULED'], required: true },
    status: { type: String, enum: ['SUCCESS', 'FAILED', 'BLOCKED', 'SKIPPED'], required: true, index: true },
    startedAt: { type: Date, required: true },
    finishedAt: { type: Date, required: true },
    error: { type: String },
    responseSummary: { type: Object },
    runByUserId: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<IConnectorSyncRun>('ConnectorSyncRun', ConnectorSyncRunSchema);
