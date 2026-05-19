"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAnalysisReportData = generateAnalysisReportData;
const reportGovernanceEnvelope_1 = require("../reporting/reportGovernanceEnvelope");
const buildTerritorialIntelligence_1 = require("../intelligence/buildTerritorialIntelligence");
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
    const territorialIntelligence = analysis.territorialIntelligence ||
        (0, buildTerritorialIntelligence_1.buildTerritorialIntelligence)({
            score: analysis.score,
            confidence: analysis.confidence,
            sourceConfidence: analysis.sourceConfidence,
            freshnessScore: analysis.freshnessScore,
            marketHeat: analysis.marketHeat,
            comparableCount: analysis.comparableCount,
            opportunityScore: analysis.opportunityScore,
            marketMomentum: analysis.marketMomentum,
            districtHeat: analysis.districtHeat,
            volatilityIndex: analysis.volatilityIndex,
            trendVelocityScore: analysis.trendVelocity?.velocityScore,
            liquidityTrendScore: analysis.liquidityTrend?.liquidityTrendScore,
            pricingDeltaRatio: analysis.pricingDeltaRatio,
            overpricingRisk: analysis.overpricingRisk,
            zoningPotential: analysis.zoningPotential,
            developmentSignals: analysis.developmentSignals,
            strategicLocationSignals: analysis.strategicLocationSignals,
            missingInputs: analysis.missingInputs,
            staleFlags: analysis.staleFlags,
            unsupportedAssumptionsCount: (governanceEnvelope.unsupportedAssumptions || []).length,
            infrastructureScore: analysis.infrastructureScore,
            roadAccessScore: analysis.roadAccessScore,
            infrastructureDistances: analysis.infrastructureDistances,
            investorSignal: analysis.investorSignal,
            regionalDemandScore: analysis.regionalDemand?.demandScore,
            riskFlags: analysis.riskFlags,
            recommendations: analysis.recommendations,
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
        territorialIntelligence,
        governance: governanceEnvelope,
        ingestionGovernance: analysis.ingestionGovernance || null,
        ingestionCompliance: analysis.ingestionCompliance || null,
        ingestionTrust: analysis.ingestionTrust || null,
        noFakeActiveProof: analysis.noFakeActiveProof,
        recommendations: analysis.recommendations || [],
        generatedAt: new Date().toISOString(),
    };
}
