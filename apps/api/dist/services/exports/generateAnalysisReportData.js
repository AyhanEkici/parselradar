"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAnalysisReportData = generateAnalysisReportData;
function generateAnalysisReportData(input) {
    const analysis = input.analysis || {};
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
        recommendations: analysis.recommendations || [],
        generatedAt: new Date().toISOString(),
    };
}
