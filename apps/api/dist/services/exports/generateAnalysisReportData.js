"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAnalysisReportData = generateAnalysisReportData;
const reportGovernanceEnvelope_1 = require("../reporting/reportGovernanceEnvelope");
function generateAnalysisReportData(input) {
    const analysis = input.analysis || {};
    const governanceEnvelope = analysis.governanceEnvelope ||
        (0, reportGovernanceEnvelope_1.buildReportGovernanceEnvelope)({
            score: analysis.score,
            confidence: analysis.confidence,
            summary: analysis.summary,
            recommendations: analysis.recommendations || [],
            risks: analysis.riskFlags || analysis.risks || [],
            missingInputs: analysis.missingInputs || [],
            staleFlags: analysis.staleFlags || [],
            sourceConfidence: analysis.sourceConfidence,
            freshnessScore: analysis.freshnessScore,
            trendSignals: analysis.trendSignals || [],
            opportunitySignals: analysis.opportunitySignals || [],
            analysisVersion: analysis.analysisVersion,
            reportText: analysis.summary,
        });
    return {
        title: String(input.property?.['addressText'] || 'Property Analysis'),
        score: analysis.score || 0,
        signal: analysis.signal || '-',
        summary: analysis.summary || analysis.previewSummary?.summary || '-',
        intelligence: {
            sourceConfidence: analysis.sourceConfidence || 'low',
            freshnessScore: analysis.freshnessScore || 0,
            analysisVersion: analysis.analysisVersion || '-',
        },
        governance: governanceEnvelope,
        recommendations: analysis.recommendations || [],
        generatedAt: new Date().toISOString(),
    };
}
