import mongoose, { Schema, Document } from 'mongoose';

export interface IPropertySubmission extends Document {
  userId: mongoose.Types.ObjectId;
  assetType: string;
  inputMethod: string;
  ilanUrl?: string;
  il: string;
  ilce: string;
  mahalleOrKoy: string;
  addressText?: string;
  latitude?: number;
  longitude?: number;
  coordinateSource?: 'exact' | 'approximate' | 'district_center_fallback';
  geocodeConfidence?: number;
  askingPriceTRY?: number;
  areaM2?: number;
  pricePerM2?: number;
  ada?: string;
  parsel?: string;
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
  dealFlowConsentStatus?: 'NOT_ASKED' | 'DECLINED' | 'OPTED_IN';
  dealFlowConsentAt?: Date;
  dealFlowConsentScope?: string[];
  professionalContactAllowed?: boolean;
  lastSpatialRefresh?: Date;
  lastMarketRefresh?: Date;
  lastTrendRefresh?: Date;
  opportunityScore?: number;
  momentumScore?: number;
  districtHeat?: number;
  ingestionState?: 'idle' | 'queued' | 'refreshing' | 'ready' | 'stale';
  status?: string;
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
  addressText: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  coordinateSource: { type: String, enum: ['exact', 'approximate', 'district_center_fallback'] },
  geocodeConfidence: { type: Number, min: 0, max: 100 },
  askingPriceTRY: { type: Number },
  areaM2: { type: Number },
  pricePerM2: { type: Number },
  ada: { type: String },
  parsel: { type: String },
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
  dealFlowConsentStatus: { type: String, enum: ['NOT_ASKED', 'DECLINED', 'OPTED_IN'], default: 'NOT_ASKED' },
  dealFlowConsentAt: { type: Date },
  dealFlowConsentScope: { type: [String], default: [] },
  professionalContactAllowed: { type: Boolean, default: false },
  lastSpatialRefresh: { type: Date },
  lastMarketRefresh: { type: Date },
  lastTrendRefresh: { type: Date },
  opportunityScore: { type: Number, min: 0, max: 100 },
  momentumScore: { type: Number, min: 0, max: 100 },
  districtHeat: { type: Number, min: 0, max: 100 },
  ingestionState: { type: String, enum: ['idle', 'queued', 'refreshing', 'ready', 'stale'] },
  status: { type: String },
}, { timestamps: true });

export default mongoose.model<IPropertySubmission>('PropertySubmission', PropertySubmissionSchema);


