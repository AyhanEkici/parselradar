import mongoose, { Document } from 'mongoose';
export interface IDealShareAudit extends Document {
    dealPoolEntryId: mongoose.Types.ObjectId;
    sharedWithType: string;
    sharedWithName: string;
    sharedWithContact: string;
    sharedFields: Record<string, unknown>;
    adminUserId: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const _default: mongoose.Model<IDealShareAudit, {}, {}, {}, mongoose.Document<unknown, {}, IDealShareAudit, {}, {}> & IDealShareAudit & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
