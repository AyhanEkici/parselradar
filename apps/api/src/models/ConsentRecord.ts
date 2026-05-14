import mongoose, { Schema, Document } from 'mongoose';

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

const ConsentRecordSchema = new Schema<IConsentRecord>({
  propertySubmissionId: { type: Schema.Types.ObjectId, ref: 'PropertySubmission', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  termsAccepted: { type: Boolean, required: true },
  privacyAccepted: { type: Boolean, required: true },
  allowAnonymizedMarketAnalytics: { type: Boolean },
  allowDealPoolEvaluation: { type: Boolean },
  allowContactForMatching: { type: Boolean },
  allowShareWithLicensedAgents: { type: Boolean },
  allowShareWithDevelopersContractors: { type: Boolean },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IConsentRecord>('ConsentRecord', ConsentRecordSchema);
