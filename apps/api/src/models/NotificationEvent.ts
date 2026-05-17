import mongoose, { Document, Schema } from 'mongoose';
import { NotificationType } from './NotificationPreference';

export interface INotificationEvent extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  payload?: Record<string, unknown>;
  readAt?: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationEventSchema = new Schema<INotificationEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'opportunity_detected',
        'market_shift',
        'infrastructure_signal',
        'stale_analysis',
        'connector_failed',
        'portfolio_risk',
        'workspace_activity',
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    payload: { type: Schema.Types.Mixed },
    readAt: { type: Date },
    archivedAt: { type: Date },
  },
  { timestamps: true }
);

NotificationEventSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INotificationEvent>('NotificationEvent', NotificationEventSchema);
