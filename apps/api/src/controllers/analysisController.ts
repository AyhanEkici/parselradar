import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import AnalysisRun from '../models/AnalysisRun';
import PropertySubmission from '../models/PropertySubmission';
import { calculateScore } from '../services/scoringService';
import { requireAuthUser } from '../utils/authUser';
import DocumentUpload from '../models/DocumentUpload';
import mongoose from 'mongoose';
import { getUserCredits } from '../utils/credits';
import CreditLedger from '../models/CreditLedger';

const COSTS = { quick: 1, insight: 3, developer: 10 };

async function deductCredits(userId: mongoose.Types.ObjectId, amount: number) {
  const credits = await getUserCredits(userId);
  if (credits < amount) throw new Error('Yetersiz kredi');
  await CreditLedger.create({ userId, type: 'ANALYSIS', amount: -amount, reason: 'Analiz' });
}

export const quickScore = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const property = await PropertySubmission.findOne({ _id: req.params.propertyId, userId: user._id });
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  await deductCredits(new mongoose.Types.ObjectId(user._id), COSTS.quick);
  const documents = await DocumentUpload.find({ propertySubmissionId: property._id });
  const result = calculateScore({ property, documents, productType: 'QUICK_SCORE' });
  const run = await AnalysisRun.create({ propertySubmissionId: property._id, userId: user._id, productType: 'QUICK_SCORE', score: result.score, signal: result.signal, riskFlags: result.riskFlags, missingInfo: result.missingInfo, assumptions: result.assumptions, unverifiableInfo: result.unverifiableInfo, previewSummary: result.previewSummary, fullAnalysis: result.fullAnalysis });
  res.json({ id: run._id, ...result.previewSummary });
};

export const parselInsight = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const property = await PropertySubmission.findOne({ _id: req.params.propertyId, userId: user._id });
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  await deductCredits(new mongoose.Types.ObjectId(user._id), COSTS.insight);
  const documents = await DocumentUpload.find({ propertySubmissionId: property._id });
  const result = calculateScore({ property, documents, productType: 'PARSEL_INSIGHT' });
  const run = await AnalysisRun.create({ propertySubmissionId: property._id, userId: user._id, productType: 'PARSEL_INSIGHT', score: result.score, signal: result.signal, riskFlags: result.riskFlags, missingInfo: result.missingInfo, assumptions: result.assumptions, unverifiableInfo: result.unverifiableInfo, previewSummary: result.previewSummary, fullAnalysis: result.fullAnalysis });
  res.json({ id: run._id, ...result.previewSummary });
};

export const developerFit = async (req: AuthRequest, res: Response) => {
  const user = requireAuthUser(req);
  const property = await PropertySubmission.findOne({ _id: req.params.propertyId, userId: user._id });
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  await deductCredits(new mongoose.Types.ObjectId(user._id), COSTS.developer);
  const documents = await DocumentUpload.find({ propertySubmissionId: property._id });
  const result = calculateScore({ property, documents, productType: 'DEVELOPER_FIT' });
  const run = await AnalysisRun.create({ propertySubmissionId: property._id, userId: user._id, productType: 'DEVELOPER_FIT', score: result.score, signal: result.signal, riskFlags: result.riskFlags, missingInfo: result.missingInfo, assumptions: result.assumptions, unverifiableInfo: result.unverifiableInfo, previewSummary: result.previewSummary, fullAnalysis: result.fullAnalysis });
  res.json({ id: run._id, ...result.previewSummary });
};
