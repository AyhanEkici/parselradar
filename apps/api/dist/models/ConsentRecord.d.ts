import mongoose, { Document } from 'mongoose';
export interface IConsentRecord extends Document {
    propertySubmissionId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    termsAccepted: boolean;
    privacyAccepted: boolean;
    allowAnonymizedMarketAnalytics?: boolean;
    allowDealPoolEvaluation?: boolean;
    allowContactForMatching?: boolean;
    allowShareWithLicensedAgents?: boolean;
    allowShareWithDevelopersContractors?: boolean;
    createdAt: Date;
}
declare const _default: mongoose.Model<IConsentRecord, {}, {}, {}, mongoose.Document<unknown, {}, IConsentRecord, {}, {}> & IConsentRecord & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
