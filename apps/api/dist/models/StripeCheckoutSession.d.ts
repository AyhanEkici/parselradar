import mongoose, { Document } from 'mongoose';
export interface IStripeCheckoutSession extends Document {
    userId: mongoose.Types.ObjectId;
    sessionId: string;
    creditAmount: number;
    status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IStripeCheckoutSession, {}, {}, {}, mongoose.Document<unknown, {}, IStripeCheckoutSession, {}, {}> & IStripeCheckoutSession & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
