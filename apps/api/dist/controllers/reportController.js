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
const reportGovernanceEnvelope_1 = require("../services/reporting/reportGovernanceEnvelope");
const buildTerritorialIntelligence_1 = require("../services/intelligence/buildTerritorialIntelligence");
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
    const reports = await Report_1.default.find({ userId: user._id }).lean();
    const withGovernance = await Promise.all(reports.map(async (report) => {
        const run = await AnalysisRun_1.default.findById(report.analysisRunId).lean();
        if (!run)
            return report;
        const full = (run.fullAnalysis || {});
        const governanceEnvelope = full.governanceEnvelope ||
            (0, reportGovernanceEnvelope_1.buildReportGovernanceEnvelope)({
                score: run.score,
                confidence: run.confidence,
                summary: run.previewSummary?.summary,
                recommendations: full.recommendations || [],
                risks: run.riskFlags || [],
                missingInputs: run.missingInputs || [],
                staleFlags: full.staleFlags || [],
                sourceConfidence: run.sourceConfidence || full.sourceConfidence,
                freshnessScore: full.freshnessScore,
                trendSignals: full.trendSignals || [],
                opportunitySignals: full.opportunitySignals || [],
                analysisVersion: run.analysisVersion || full.analysisVersion,
            });
        const territorialIntelligence = full.territorialIntelligence ||
            (0, buildTerritorialIntelligence_1.buildTerritorialIntelligence)({
                score: run.score,
                confidence: run.confidence,
                sourceConfidence: run.sourceConfidence || full.sourceConfidence,
                freshnessScore: full.freshnessScore,
                marketHeat: full.marketHeat,
                comparableCount: full.comparableCount,
                opportunityScore: full.opportunityScore,
                marketMomentum: full.marketMomentum,
                districtHeat: full.districtHeat,
                volatilityIndex: full.volatilityIndex,
                trendVelocityScore: full.trendVelocity?.velocityScore,
                liquidityTrendScore: full.liquidityTrend?.liquidityTrendScore,
                pricingDeltaRatio: full.pricingDeltaRatio,
                overpricingRisk: full.overpricingRisk,
                zoningPotential: full.zoningPotential,
                developmentSignals: full.developmentSignals,
                strategicLocationSignals: full.strategicLocationSignals,
                missingInputs: run.missingInputs || [],
                staleFlags: full.staleFlags || [],
                unsupportedAssumptionsCount: (governanceEnvelope.unsupportedAssumptions || []).length,
                infrastructureScore: full.infrastructureScore,
                roadAccessScore: full.roadAccessScore,
                infrastructureDistances: full.infrastructureDistances,
                investorSignal: full.investorSignal,
                regionalDemandScore: full.regionalDemand?.demandScore,
                riskFlags: run.riskFlags || [],
                recommendations: full.recommendations || [],
            });
        return {
            ...report,
            governanceClassification: governanceEnvelope.governanceClassification,
            trustScore: governanceEnvelope.trustScore,
            disclosureMode: governanceEnvelope.disclosureSummary?.mode,
            regionalOutlook: territorialIntelligence.longTermRegionalOutlook?.value,
            developmentProbability: territorialIntelligence.developmentProbability?.value,
            ingestionComplianceState: full.ingestionCompliance?.complianceState,
            noFakeActiveProof: full.noFakeActiveProof,
            monitoringState: full.operationalIntelligence?.monitoring?.state,
            opportunityLevel: full.operationalIntelligence?.opportunities?.strategicOpportunity?.level,
            autonomyState: full.autonomyIntelligence?.autonomy?.autonomy?.autonomyState,
            reviewQueueDepth: full.autonomyIntelligence?.operations?.reviewQueue?.queueDepth,
            suppressionActiveRules: full.autonomyIntelligence?.operations?.suppression?.activeCount,
            cadenceMinutes: full.autonomyIntelligence?.autonomy?.cadence?.cadenceMinutes,
            executionReadiness: full.executionOperatingSystem?.executionReadiness,
            executionDeterministic: full.executionOperatingSystem?.deterministic,
            executionGovernanceState: full.executionOperatingSystem?.governanceState,
        };
    }));
    res.json(withGovernance);
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
