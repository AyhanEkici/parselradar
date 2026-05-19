import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    email: string;
    passwordHash: string;
    name: string;
    role: 'USER' | 'ADMIN';
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
