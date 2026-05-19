import mongoose, { Document } from 'mongoose';
export interface IPropertySubmission extends Document {
    userId: mongoose.Types.ObjectId;
    assetType: string;
    inputMethod: string;
    ilanUrl?: string;
    il: string;
    ilce: string;
    mahalleOrKoy: string;
    addressText: string;
    latitude?: number;
    longitude?: number;
    askingPriceTRY: number;
    areaM2: number;
    pricePerM2: number;
    ada: string;
    parsel: string;
    pafta?: string;
    nitelik?: string;
    tapuType: string;
    zoningStatus: string;
    taks?: string;
    kaks?: string;
    emsal?: string;
    gabari?: string;
    hmax?: string;
    katAdedi?: string;
    cekmeMesafeleri?: string;
    planNotlariText?: string;
    roadAccess: string;
    electricity: string;
    water: string;
    villageDistanceText?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPropertySubmission, {}, {}, {}, mongoose.Document<unknown, {}, IPropertySubmission, {}, {}> & IPropertySubmission & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
