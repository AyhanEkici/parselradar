"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadReport = exports.getReports = exports.purchasePDF = void 0;
const authUser_1 = require("../utils/authUser");
const Report_1 = __importDefault(require("../models/Report"));
const AnalysisRun_1 = __importDefault(require("../models/AnalysisRun"));
const pdfService_1 = require("../services/pdfService");
const credits_1 = require("../utils/credits");
const CreditLedger_1 = __importDefault(require("../models/CreditLedger"));
const path_1 = __importDefault(require("path"));
const PDF_COST = 5;
const purchasePDF = async (req, res) => {
    const user = (0, authUser_1.requireAuthUser)(req);
    const run = await AnalysisRun_1.default.findOne({ _id: req.params.analysisRunId, userId: user._id });
    if (!run)
        return res.status(404).json({ error: 'Analiz bulunamadı' });
    const credits = await (0, credits_1.getUserCredits)(user._id);
    if (credits < PDF_COST)
        return res.status(400).json({ error: 'Yetersiz kredi' });
    await CreditLedger_1.default.create({ userId: user._id, type: 'PDF_PURCHASE', amount: -PDF_COST, reason: 'PDF rapor' });
    const pdfPath = path_1.default.join(__dirname, `../../uploads/report-${run._id}.pdf`);
    await (0, pdfService_1.generateReportPDF)({
        analysisRun: run,
        reportMeta: {
            reportId: undefined, // will be set after creation
            userId: user._id,
            date: new Date(),
            reportType: 'DETAILED_PDF_REPORT',
            pdfPath,
            creditsCharged: PDF_COST,
        }
    }, pdfPath);
    const report = await Report_1.default.create({ analysisRunId: run._id, propertySubmissionId: run.propertySubmissionId, userId: user._id, reportType: 'DETAILED_PDF_REPORT', pdfPath, creditsCharged: PDF_COST });
    res.json({ id: report._id });
};
exports.purchasePDF = purchasePDF;
const getReports = async (req, res) => {
    const user = (0, authUser_1.requireAuthUser)(req);
    const reports = await Report_1.default.find({ userId: user._id });
    res.json(reports);
};
exports.getReports = getReports;
const downloadReport = async (req, res) => {
    const user = (0, authUser_1.requireAuthUser)(req);
    const report = await Report_1.default.findOne({ _id: req.params.id, userId: user._id });
    if (!report)
        return res.status(404).json({ error: 'Rapor bulunamadı' });
    res.download(report.pdfPath);
};
exports.downloadReport = downloadReport;
