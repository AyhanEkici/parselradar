import mongoose, { Document, Schema } from 'mongoose';

export type NotificationDeliveryState =
  | 'NOT_CONFIGURED'
  | 'DISABLED'
  | 'QUEUED'
  | 'SENT'
  | 'FAILED'
  | 'SUPPRESSED';

export interface INotificationDelivery extends Document {
  userId: mongoose.Types.ObjectId;
  notificationEventId: mongoose.Types.ObjectId;
  channel: 'IN_APP' | 'EMAIL';
  provider: 'none' | 'stub-email';
  state: NotificationDeliveryState;
  suppressReason?: string;
  failureReason?: string;
  attempts: number;
  queuedAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationDeliverySchema = new Schema<INotificationDelivery>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    notificationEventId: { type: Schema.Types.ObjectId, ref: 'NotificationEvent', required: true, index: true },
    channel: { type: String, enum: ['IN_APP', 'EMAIL'], required: true, index: true },
    provider: { type: String, enum: ['none', 'stub-email'], default: 'none' },
    state: {
      type: String,
      enum: ['NOT_CONFIGURED', 'DISABLED', 'QUEUED', 'SENT', 'FAILED', 'SUPPRESSED'],
      required: true,
      index: true,
    },
    suppressReason: { type: String },
    failureReason: { type: String },
    attempts: { type: Number, default: 0 },
    queuedAt: { type: Date },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

NotificationDeliverySchema.index({ userId: 1, notificationEventId: 1, channel: 1 }, { unique: true });

export default mongoose.model<INotificationDelivery>('NotificationDelivery', NotificationDeliverySchema);
