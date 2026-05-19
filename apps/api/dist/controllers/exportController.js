"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAnalysisByProperty = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PropertySubmission_1 = __importDefault(require("../models/PropertySubmission"));
const AnalysisRun_1 = __importDefault(require("../models/AnalysisRun"));
const AnalysisExport_1 = __importDefault(require("../models/AnalysisExport"));
const buildAnalysisExportPayload_1 = require("../services/exports/buildAnalysisExportPayload");
const generateAnalysisReportData_1 = require("../services/exports/generateAnalysisReportData");
const scopeFilters_1 = require("../utils/scopeFilters");
function userObjectId(req) {
    return new mongoose_1.default.Types.ObjectId(String(req.user?._id));
}
const exportAnalysisByProperty = async (req, res) => {
    const userId = userObjectId(req);
    const propertyId = req.params.propertyId;
    if (!mongoose_1.default.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({ error: 'Geçersiz propertyId' });
    }
    const [property, analysis] = await Promise.all([
        PropertySubmission_1.default.findOne((0, scopeFilters_1.propertyOwnerScope)(req.user, { _id: propertyId })).lean(),
        AnalysisRun_1.default.findOne((0, scopeFilters_1.analysisOwnerScope)(req.user, { propertySubmissionId: propertyId })).sort({ createdAt: -1 }).lean(),
    ]);
    if (!property)
        return res.status(404).json({ error: 'Mülk bulunamadı' });
    if (!analysis)
        return res.status(404).json({ error: 'Analiz bulunamadı' });
    const report = (0, generateAnalysisReportData_1.generateAnalysisReportData)({
        property,
        analysis: {
            ...analysis,
            ...analysis.fullAnalysis,
            summary: analysis.previewSummary?.summary,
        },
    });
    const payload = (0, buildAnalysisExportPayload_1.buildAnalysisExportPayload)({
        property,
        analysis: report,
    });
    const exportDoc = await AnalysisExport_1.default.create({
        userId,
        propertySubmissionId: property._id,
        analysisRunId: analysis._id,
        format: 'json',
        payload,
    });
    return res.json({
        exportId: exportDoc._id,
        format: 'json',
        payload,
    });
};
exports.exportAnalysisByProperty = exportAnalysisByProperty;
