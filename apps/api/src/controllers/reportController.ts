import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { requireAuthUser } from '../utils/authUser';
import Report from '../models/Report';
import AnalysisRun from '../models/AnalysisRun';
import { generateReportPDF } from '../services/pdfService';
import { getUserCredits } from '../utils/credits';
import CreditLedger from '../models/CreditLedger';
import path from 'path';
import { buildReportGovernanceEnvelope } from '../services/reporting/reportGovernanceEnvelope';
import { buildTerritorialIntelligence } from '../services/intelligence/buildTerritorialIntelligence';

const PDF_COST = 5;

export const purchasePDF = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const run = await AnalysisRun.findOne({ _id: req.params.analysisRunId, userId: user._id });
  if (!run) return res.status(404).json({ error: 'Analiz bulunamadı' });
  const credits = await getUserCredits(user._id);
  if (credits < PDF_COST) return res.status(400).json({ error: 'Yetersiz kredi' });
  await CreditLedger.create({ userId: user._id, type: 'PDF_PURCHASE', amount: -PDF_COST, reason: 'PDF rapor' });
  const pdfPath = path.join(__dirname, `../../uploads/report-${run._id}.pdf`);
  await generateReportPDF({
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
  const report = await Report.create({ analysisRunId: run._id, propertySubmissionId: run.propertySubmissionId, userId: user._id, reportType: 'DETAILED_PDF_REPORT', pdfPath, creditsCharged: PDF_COST });
  res.json({ id: report._id });
};

export const getReports = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const reports = await Report.find({ userId: user._id }).lean();

  const withGovernance = await Promise.all(
    reports.map(async (report: any) => {
      const run = await AnalysisRun.findById(report.analysisRunId).lean();
      if (!run) return report;
      const full = (run.fullAnalysis || {}) as Record<string, any>;
      const governanceEnvelope =
        full.governanceEnvelope ||
        buildReportGovernanceEnvelope({
          score: run.score,
          confidence: run.confidence,
          summary: run.previewSummary?.summary as string,
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
      const territorialIntelligence =
        full.territorialIntelligence ||
        buildTerritorialIntelligence({
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
      };
    })
  );

  res.json(withGovernance);
};

export const downloadReport = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const report = await Report.findOne({ _id: req.params.id, userId: user._id });
  if (!report) return res.status(404).json({ error: 'Rapor bulunamadı' });
  res.download(report.pdfPath);
};
