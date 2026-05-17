import mongoose, { Schema, Document } from 'mongoose';

/**
 * Records the result of a connector test run.
 * samplePayloadSchema holds the shape of the sample response (keys and types),
 * never raw data or secret values.
 */
export interface IConnectorTestRun extends Document {
  connectorKey: string;
  state: 'TEST_PASSED' | 'TEST_FAILED';
  message: string;
  samplePayloadSchema?: Record<string, unknown>;
  checkedAt: Date;
  runByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectorTestRunSchema = new Schema<IConnectorTestRun>(
  {
    connectorKey: { type: String, required: true, index: true },
    state: { type: String, enum: ['TEST_PASSED', 'TEST_FAILED'], required: true },
    message: { type: String, required: true },
    samplePayloadSchema: { type: Object },
    checkedAt: { type: Date, default: Date.now },
    runByUserId: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IConnectorTestRun>('ConnectorTestRun', ConnectorTestRunSchema);
