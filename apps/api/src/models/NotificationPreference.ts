import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'opportunity_detected'
  | 'market_shift'
  | 'infrastructure_signal'
  | 'stale_analysis'
  | 'connector_failed'
  | 'portfolio_risk'
  | 'workspace_activity';

export interface INotificationPreference extends Document {
  userId: mongoose.Types.ObjectId;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  digestEnabled: boolean;
  digestSchedule: 'daily' | 'weekly' | 'off';
  mutedTypes: NotificationType[];
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    emailEnabled: { type: Boolean, default: false },
    inAppEnabled: { type: Boolean, default: true },
    digestEnabled: { type: Boolean, default: true },
    digestSchedule: { type: String, enum: ['daily', 'weekly', 'off'], default: 'daily' },
    mutedTypes: {
      type: [String],
      enum: [
        'opportunity_detected',
        'market_shift',
        'infrastructure_signal',
        'stale_analysis',
        'connector_failed',
        'portfolio_risk',
        'workspace_activity',
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model<INotificationPreference>('NotificationPreference', NotificationPreferenceSchema);
