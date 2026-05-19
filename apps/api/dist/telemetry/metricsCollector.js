"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectTelemetryMetrics = collectTelemetryMetrics;
const AnalysisRun_1 = __importDefault(require("../models/AnalysisRun"));
const PropertySubmission_1 = __importDefault(require("../models/PropertySubmission"));
async function collectTelemetryMetrics() {
    const [analysisCount, propertyCount] = await Promise.all([
        AnalysisRun_1.default.countDocuments({}),
        PropertySubmission_1.default.countDocuments({}),
    ]);
    return {
        analysisCount,
        propertyCount,
        collectedAt: new Date().toISOString(),
    };
}
