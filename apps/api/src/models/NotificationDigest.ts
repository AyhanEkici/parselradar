import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationDigest extends Document {
  userId: mongoose.Types.ObjectId;
  schedule: 'daily' | 'weekly';
  itemCount: number;
  notificationEventIds: mongoose.Types.ObjectId[];
  deliveryState: 'NOT_CONFIGURED' | 'DISABLED' | 'QUEUED' | 'SENT' | 'FAILED' | 'SUPPRESSED';
  createdAt: Date;
  updatedAt: Date;
}

const NotificationDigestSchema = new Schema<INotificationDigest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    schedule: { type: String, enum: ['daily', 'weekly'], required: true },
    itemCount: { type: Number, default: 0 },
    notificationEventIds: { type: [Schema.Types.ObjectId], ref: 'NotificationEvent', default: [] },
    deliveryState: {
      type: String,
      enum: ['NOT_CONFIGURED', 'DISABLED', 'QUEUED', 'SENT', 'FAILED', 'SUPPRESSED'],
      default: 'QUEUED',
      index: true,
    },
  },
  { timestamps: true }
);

NotificationDigestSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INotificationDigest>('NotificationDigest', NotificationDigestSchema);
