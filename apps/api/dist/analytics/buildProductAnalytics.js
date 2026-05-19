"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProductAnalytics = buildProductAnalytics;
const PropertySubmission_1 = __importDefault(require("../models/PropertySubmission"));
const Report_1 = __importDefault(require("../models/Report"));
const AnalysisRun_1 = __importDefault(require("../models/AnalysisRun"));
async function buildProductAnalytics() {
    const [properties, reports, analyses] = await Promise.all([
        PropertySubmission_1.default.countDocuments({}),
        Report_1.default.countDocuments({}),
        AnalysisRun_1.default.countDocuments({}),
    ]);
    return {
        properties,
        reports,
        analyses,
        productState: analyses > 0 ? 'ACTIVE' : 'READY',
    };
}
