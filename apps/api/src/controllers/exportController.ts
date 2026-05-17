import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import PropertySubmission from '../models/PropertySubmission';
import AnalysisRun from '../models/AnalysisRun';
import AnalysisExport from '../models/AnalysisExport';
import { buildAnalysisExportPayload } from '../services/exports/buildAnalysisExportPayload';
import { generateAnalysisReportData } from '../services/exports/generateAnalysisReportData';

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
    PropertySubmission.findOne({ _id: propertyId, userId }).lean(),
    AnalysisRun.findOne({ propertySubmissionId: propertyId, userId }).sort({ createdAt: -1 }).lean(),
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
