import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditEvent extends Document {
  type: string;
  actorUserId?: string;
  actorRole?: string;
  targetType?: string;
  targetId?: string;
  message: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  success?: boolean;
  createdAt: Date;
}

const AuditEventSchema = new Schema<IAuditEvent>({
  type: { type: String, required: true, index: true },
  actorUserId: { type: String, index: true },
  actorRole: { type: String },
  targetType: { type: String },
  targetId: { type: String },
  message: { type: String, required: true },
  metadata: { type: Object },
  ip: { type: String },
  userAgent: { type: String },
  success: { type: Boolean },
  createdAt: { type: Date, default: Date.now, index: true },
});

export default mongoose.model<IAuditEvent>('AuditEvent', AuditEventSchema);
