import mongoose, { Document } from 'mongoose';
export interface IAnalysisRun extends Document {
    propertySubmissionId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    productType: string;
    score: number;
    signal: string;
    riskFlags: string[];
    missingInfo: string[];
    assumptions: string[];
    unverifiableInfo: string[];
    previewSummary: Record<string, unknown>;
    fullAnalysis: Record<string, unknown>;
    createdAt: Date;
}
declare const _default: mongoose.Model<IAnalysisRun, {}, {}, {}, mongoose.Document<unknown, {}, IAnalysisRun, {}, {}> & IAnalysisRun & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
