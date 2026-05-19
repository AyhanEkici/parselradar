import mongoose, { Document } from 'mongoose';
export interface IDocumentUpload extends Document {
    propertySubmissionId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    documentType: string;
    originalName: string;
    storedPath: string;
    mimeType: string;
    sizeBytes: number;
    uploadedAt: Date;
}
declare const _default: mongoose.Model<IDocumentUpload, {}, {}, {}, mongoose.Document<unknown, {}, IDocumentUpload, {}, {}> & IDocumentUpload & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
