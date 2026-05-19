"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildIngestionAnalytics = buildIngestionAnalytics;
const PropertySubmission_1 = __importDefault(require("../models/PropertySubmission"));
const AuditEvent_1 = __importDefault(require("../models/AuditEvent"));
async function buildIngestionAnalytics() {
    const [totalProperties, staleProperties, ingestionAudits] = await Promise.all([
        PropertySubmission_1.default.countDocuments({}),
        PropertySubmission_1.default.countDocuments({ ingestionState: 'stale' }),
        AuditEvent_1.default.countDocuments({ type: { $regex: 'ingestion', $options: 'i' } }),
    ]);
    return {
        totalProperties,
        staleProperties,
        ingestionAudits,
        ingestionState: staleProperties > 0 ? 'DEGRADED' : 'READY',
    };
}
