import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<ICreditLedger, {}, {}, {}, mongoose.Document<unknown, {}, ICreditLedger, {}, {}> & ICreditLedger & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
