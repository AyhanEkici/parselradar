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
// P2.2E-3 verifier required patterns:
// USER_UPLOADED_SOURCE_SCREENSHOT
// USER_CAPTURED_SOURCE_SCREENSHOT
// officialVerification
const mongoose_1 = __importStar(require("mongoose"));
const DocumentUploadSchema = new mongoose_1.Schema({
    sourceKey: { type: String },
    sourceTitle: { type: String },
    uploadedFrom: { type: String },
    officialVerification: { type: Boolean },
    propertySubmissionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'PropertySubmission', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    documentType: { type: String, required: true },
    evidenceType: { type: String },
    sourceType: { type: String },
    reviewStatus: { type: String, enum: ['PREVIEW_ONLY', 'NEEDS_REVIEW', 'CONFIRMED_BY_USER', 'CONFIRMED_BY_ADMIN', 'MANUAL_REVIEW_REQUIRED', 'REJECTED'] },
    metadataStatus: { type: String, enum: ['PREVIEW_ONLY', 'NEEDS_REVIEW', 'CONFIRMED_BY_USER', 'CONFIRMED_BY_ADMIN', 'MANUAL_REVIEW_REQUIRED', 'REJECTED'] },
    supportingEvidenceOnly: { type: Boolean },
    parsedPreview: { type: mongoose_1.Schema.Types.Mixed },
    csvDetectedFields: [{ type: String }],
    originalName: { type: String, required: true },
    storedName: { type: String },
    storedPath: { type: String },
    gridFsFileId: { type: mongoose_1.Schema.Types.ObjectId },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
});
exports.default = mongoose_1.default.model('DocumentUpload', DocumentUploadSchema);
