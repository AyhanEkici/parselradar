import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { requireAuthUser } from '../utils/authUser';
import Report from '../models/Report';
import AnalysisRun from '../models/AnalysisRun';
import { generateReportPDF } from '../services/pdfService';
import { getUserCredits } from '../utils/credits';
import CreditLedger from '../models/CreditLedger';
import path from 'path';

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
  const reports = await Report.find({ userId: user._id });
  res.json(reports);
};

export const downloadReport = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const report = await Report.findOne({ _id: req.params.id, userId: user._id });
  if (!report) return res.status(404).json({ error: 'Rapor bulunamadı' });
  res.download(report.pdfPath);
};
