import mongoose, { Document } from 'mongoose';
export interface IReport extends Document {
    analysisRunId: mongoose.Types.ObjectId;
    propertySubmissionId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    reportType: string;
    pdfPath: string;
    creditsCharged: number;
    createdAt: Date;
}
declare const _default: mongoose.Model<IReport, {}, {}, {}, mongoose.Document<unknown, {}, IReport, {}, {}> & IReport & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
