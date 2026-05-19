"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const PropertySubmissionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
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
    lastSpatialRefresh: { type: Date },
    lastMarketRefresh: { type: Date },
    lastTrendRefresh: { type: Date },
    opportunityScore: { type: Number, min: 0, max: 100 },
    momentumScore: { type: Number, min: 0, max: 100 },
    districtHeat: { type: Number, min: 0, max: 100 },
    ingestionState: { type: String, enum: ['idle', 'queued', 'refreshing', 'ready', 'stale'] },
    status: { type: String },
}, { timestamps: true });
exports.default = mongoose_1.default.model('PropertySubmission', PropertySubmissionSchema);
