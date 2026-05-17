import mongoose, { Schema, Document } from 'mongoose';

/**
 * Stores only the presence mask of connector credentials — never raw secret values.
 * maskedKeys is a map of credential env key name -> true (present) | false (absent).
 */
export interface IConnectorCredentialProfile extends Document {
  connectorKey: string;
  maskedKeys: Record<string, boolean>;
  updatedAt: Date;
  updatedByUserId: string;
}

const ConnectorCredentialProfileSchema = new Schema<IConnectorCredentialProfile>({
  connectorKey: { type: String, required: true, unique: true, index: true },
  maskedKeys: { type: Object, required: true, default: {} },
  updatedAt: { type: Date, default: Date.now },
  updatedByUserId: { type: String, required: true },
});

export default mongoose.model<IConnectorCredentialProfile>(
  'ConnectorCredentialProfile',
  ConnectorCredentialProfileSchema,
);
