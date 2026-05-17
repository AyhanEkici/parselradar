import mongoose, { Schema, Document } from 'mongoose';

export interface IStripeCheckoutSession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  creditAmount: number;
  amountTotal?: number;
  currency?: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  fulfilledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StripeCheckoutSessionSchema = new Schema<IStripeCheckoutSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true, unique: true },
  creditAmount: { type: Number, required: true },
  amountTotal: { type: Number },
  currency: { type: String },
  status: { type: String, enum: ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED'], required: true },
  fulfilledAt: { type: Date },
}, { timestamps: true });

export default mongoose.model<IStripeCheckoutSession>('StripeCheckoutSession', StripeCheckoutSessionSchema);
