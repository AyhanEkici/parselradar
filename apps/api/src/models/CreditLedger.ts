import mongoose, { Schema, Document } from 'mongoose';

export interface ICreditLedger extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  amount: number;
  reason?: string;
  relatedEntityId?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
}

const CreditLedgerSchema = new Schema<ICreditLedger>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  reason: { type: String },
  relatedEntityId: { type: String },
  stripeCheckoutSessionId: { type: String },
  stripePaymentIntentId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICreditLedger>('CreditLedger', CreditLedgerSchema);
