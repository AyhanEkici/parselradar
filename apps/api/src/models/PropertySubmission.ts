import mongoose, { Schema, Document } from 'mongoose';

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

const PropertySubmissionSchema = new Schema<IPropertySubmission>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assetType: { type: String, required: true },
  inputMethod: { type: String, required: true },
  ilanUrl: { type: String },
  il: { type: String, required: true },
  ilce: { type: String, required: true },
  mahalleOrKoy: { type: String, required: true },
  addressText: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  askingPriceTRY: { type: Number, required: true },
  areaM2: { type: Number, required: true },
  pricePerM2: { type: Number, required: true },
  ada: { type: String, required: true },
  parsel: { type: String, required: true },
  pafta: { type: String },
  nitelik: { type: String },
  tapuType: { type: String, required: true },
  zoningStatus: { type: String, required: true },
  taks: { type: String },
  kaks: { type: String },
  emsal: { type: String },
  gabari: { type: String },
  hmax: { type: String },
  katAdedi: { type: String },
  cekmeMesafeleri: { type: String },
  planNotlariText: { type: String },
  roadAccess: { type: String, required: true },
  electricity: { type: String, required: true },
  water: { type: String, required: true },
  villageDistanceText: { type: String },
  status: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IPropertySubmission>('PropertySubmission', PropertySubmissionSchema);
