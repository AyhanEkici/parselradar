import mongoose, { Schema, Document } from 'mongoose';

export interface IStripeCheckoutSession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  creditAmount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const StripeCheckoutSessionSchema = new Schema<IStripeCheckoutSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true, unique: true },
  creditAmount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED'], required: true },
}, { timestamps: true });

export default mongoose.model<IStripeCheckoutSession>('StripeCheckoutSession', StripeCheckoutSessionSchema);
