
import mongoose, { Schema, Document } from 'mongoose';

export interface IDealShareAudit extends Document {
  dealPoolEntryId: mongoose.Types.ObjectId;
  sharedWithType: string;
  sharedWithName: string;
  sharedWithContact: string;
  sharedFields: Record<string, unknown>;
  adminUserId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DealShareAuditSchema = new Schema<IDealShareAudit>({
  dealPoolEntryId: { type: Schema.Types.ObjectId, ref: 'DealPoolEntry', required: true },
  sharedWithType: { type: String, required: true },
  sharedWithName: { type: String, required: true },
  sharedWithContact: { type: String, required: true },
  sharedFields: { type: Schema.Types.Mixed, required: true },
  adminUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IDealShareAudit>('DealShareAudit', DealShareAuditSchema);
