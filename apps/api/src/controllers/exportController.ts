import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import PropertySubmission from '../models/PropertySubmission';
import AnalysisRun from '../models/AnalysisRun';
import AnalysisExport from '../models/AnalysisExport';
import { buildAnalysisExportPayload } from '../services/exports/buildAnalysisExportPayload';
import { generateAnalysisReportData } from '../services/exports/generateAnalysisReportData';
import { analysisOwnerScope, propertyOwnerScope } from '../utils/scopeFilters';

function userObjectId(req: AuthRequest) {
  return new mongoose.Types.ObjectId(String(req.user?._id));
}

export const exportAnalysisByProperty = async (req: AuthRequest, res: Response) => {
  const userId = userObjectId(req);
  const propertyId = req.params.propertyId;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({ error: 'Geçersiz propertyId' });
  }

  const [property, analysis] = await Promise.all([
    PropertySubmission.findOne(propertyOwnerScope(req.user, { _id: propertyId })).lean(),
    AnalysisRun.findOne(analysisOwnerScope(req.user, { propertySubmissionId: propertyId })).sort({ createdAt: -1 }).lean(),
  ]);

  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  if (!analysis) return res.status(404).json({ error: 'Analiz bulunamadı' });

  const report = generateAnalysisReportData({
    property,
    analysis: {
      ...analysis,
      ...analysis.fullAnalysis,
      summary: analysis.previewSummary?.summary,
    },
  });

  const payload = buildAnalysisExportPayload({
    property,
    analysis: report,
  });

  const exportDoc = await AnalysisExport.create({
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
