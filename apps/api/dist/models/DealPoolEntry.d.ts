import mongoose, { Document } from 'mongoose';
export interface IDealPoolEntry extends Document {
    propertySubmissionId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    status: string;
    matchCategories: string[];
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IDealPoolEntry, {}, {}, {}, mongoose.Document<unknown, {}, IDealPoolEntry, {}, {}> & IDealPoolEntry & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
