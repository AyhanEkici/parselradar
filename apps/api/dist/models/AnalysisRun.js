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
const AnalysisRunSchema = new mongoose_1.Schema({
    propertySubmissionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'PropertySubmission', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    productType: { type: String, required: true },
    score: { type: Number, required: true },
    signal: { type: String, required: true },
    confidence: { type: Number },
    strengths: { type: [String], required: true },
    risks: { type: [String], required: true },
    riskFlags: { type: [String], required: true },
    missingInputs: { type: [String], required: true },
    missingInfo: { type: [String], required: true },
    assumptions: { type: [String], required: true },
    unverifiableInfo: { type: [String], required: true },
    factorsUsed: { type: mongoose_1.Schema.Types.Mixed },
    recommendation: { type: String },
    previewSummary: { type: mongoose_1.Schema.Types.Mixed, required: true },
    fullAnalysis: { type: mongoose_1.Schema.Types.Mixed, required: true },
    analysisVersion: { type: String },
    refreshReason: { type: String },
    sourceConfidence: { type: String, enum: ['low', 'medium', 'verified'] },
    cacheTimestamp: { type: Date },
    createdAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('AnalysisRun', AnalysisRunSchema);
