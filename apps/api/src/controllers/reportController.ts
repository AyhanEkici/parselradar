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
import { analysisOwnerScope, reportOwnerScope } from '../utils/scopeFilters';
import { sensitiveDataScanner } from '../security/sensitiveDataScanner';
import { exportGovernanceEngine } from '../security/exportGovernanceEngine';
import { exportAuditEngine } from '../audit/exportAuditEngine';
import { logAuditEvent } from '../utils/auditLog';
import ConnectorSyncRun from '../models/ConnectorSyncRun';

const PDF_COST = 5;

export const purchasePDF = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const run = await AnalysisRun.findOne(analysisOwnerScope(user, { _id: req.params.analysisRunId }));
  if (!run) {
    await logAuditEvent({
      type: 'report_purchase_failed',
      actorUserId: String(user._id),
      actorRole: String(user.role),
      targetType: 'AnalysisRun',
      targetId: String(req.params.analysisRunId || ''),
      message: 'Report purchase failed: analysis not found',
      metadata: { analysisRunId: req.params.analysisRunId },
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: false,
    });
    return res.status(404).json({ error: 'Analiz bulunamadı' });
  }
  const credits = await getUserCredits(user._id);
  if (credits < PDF_COST) {
    await logAuditEvent({
      type: 'report_purchase_failed',
      actorUserId: String(user._id),
      actorRole: String(user.role),
      targetType: 'AnalysisRun',
      targetId: String(run._id),
      message: 'Report purchase failed: insufficient credits',
      metadata: { availableCredits: credits, requiredCredits: PDF_COST },
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: false,
    });
    return res.status(400).json({ error: 'Yetersiz kredi' });
  }
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
  await logAuditEvent({
    type: 'report_purchase_completed',
    actorUserId: String(user._id),
    actorRole: String(user.role),
    targetType: 'Report',
    targetId: String(report._id),
    message: 'Report purchase completed',
    metadata: { analysisRunId: String(run._id), creditsCharged: PDF_COST },
    ip: req.ip,
    userAgent: req.get('user-agent'),
    success: true,
  });
  res.json({ id: report._id });
};

export const getReports = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const reports = await Report.find(reportOwnerScope(user, {})).lean();
  const latestSafeSync = await ConnectorSyncRun.findOne({
    status: 'SUCCESS',
  })
    .sort({ finishedAt: -1 })
    .lean();
  const fieldScan = sensitiveDataScanner({
    fields: reports.length > 0 ? Object.keys(reports[0] || {}) : [],
  });
  const exportPolicy = exportGovernanceEngine({
    recordCount: reports.length,
    includesSensitiveFields: fieldScan.hasSensitiveData,
    requesterIsAdmin: user.role === 'ADMIN',
  });

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
        autonomyState: full.autonomyIntelligence?.autonomy?.autonomy?.autonomyState,
        reviewQueueDepth: full.autonomyIntelligence?.operations?.reviewQueue?.queueDepth,
        suppressionActiveRules: full.autonomyIntelligence?.operations?.suppression?.activeCount,
        cadenceMinutes: full.autonomyIntelligence?.autonomy?.cadence?.cadenceMinutes,
        reportEvidencePolicy: {
          usesOnlyProvenSyncedMetadataAndSupportingEvidence: true,
          fakeOfficialResultClaimsAllowed: false,
          automatedOfficialZoningVerification: false,
          lastSafeMetadataSyncAt: latestSafeSync?.finishedAt || null,
          note: 'Report enrichment uses synced metadata/supporting evidence only; no fake official result claims.',
        },
        executionReadiness: full.executionOperatingSystem?.executionReadiness,
        executionDeterministic: full.executionOperatingSystem?.deterministic,
        executionGovernanceState: full.executionOperatingSystem?.governanceState,
      };
    })
  );

  const auditPayload = exportAuditEngine({
    userId: user._id.toString(),
    format: 'json',
    recordCount: withGovernance.length,
    blocked: !exportPolicy.allowed,
  });
  await logAuditEvent({
    type: 'report_list_export_access',
    actorUserId: user._id.toString(),
    actorRole: user.role,
    targetType: 'Report',
    targetId: user._id.toString(),
    message: 'Report list accessed',
    metadata: auditPayload,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    success: exportPolicy.allowed,
  });

  res.setHeader('X-Export-Policy', exportPolicy.exportRisk);
  res.json(withGovernance);
};

export const downloadReport = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const report = await Report.findOne(reportOwnerScope(user, { _id: req.params.id }));
  if (!report) return res.status(404).json({ error: 'Rapor bulunamadı' });

  const exportPolicy = exportGovernanceEngine({
    recordCount: 1,
    includesSensitiveFields: false,
    requesterIsAdmin: user.role === 'ADMIN',
  });
  await logAuditEvent({
    type: 'report_download_access',
    actorUserId: user._id.toString(),
    actorRole: user.role,
    targetType: 'Report',
    targetId: String(report._id),
    message: 'Report download accessed',
    metadata: {
      allowed: exportPolicy.allowed,
      exportRisk: exportPolicy.exportRisk,
    },
    ip: req.ip,
    userAgent: req.get('user-agent'),
    success: exportPolicy.allowed,
  });

  if (!exportPolicy.allowed) {
    return res.status(403).json({ error: 'Rapor dışa aktarma politikası tarafından engellendi' });
  }
  res.download(report.pdfPath);
};
