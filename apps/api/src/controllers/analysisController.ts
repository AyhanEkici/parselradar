// FULL FILE REPLACEMENT: Minimal, compile-safe, contract-matching implementation
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import PropertySubmission from '../models/PropertySubmission';
import AnalysisRun from '../models/AnalysisRun';
import mongoose from 'mongoose';
import { getUserCredits } from '../utils/credits';
import CreditLedger from '../models/CreditLedger';

const COSTS = { quick: 1 };

async function deductCredits(userId: mongoose.Types.ObjectId, amount: number) {
  const credits = await getUserCredits(userId);
  if (credits < amount) throw new Error('Yetersiz kredi');
  await CreditLedger.create({ userId, type: 'ANALYSIS', amount: -amount, reason: 'Analiz' });
}

export const quickScore = async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const property = await PropertySubmission.findOne({ _id: req.params.propertyId, userId });
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  const existingRun = await AnalysisRun.findOne({ propertySubmissionId: property._id, userId, productType: 'QUICK_SCORE' });
  if (existingRun) {
    return res.json({
      id: existingRun._id,
      score: existingRun.score,
      signal: existingRun.signal,
      reused: true,
      message: 'Idempotent: existing quick-score result reused.'
    });
  }
  try {
    await deductCredits(new mongoose.Types.ObjectId(userId), COSTS.quick);
    // Minimal placeholder for score/signal
    const run = await AnalysisRun.create({
      propertySubmissionId: property._id,
      userId,
      productType: 'QUICK_SCORE',
      score: 0,
      signal: 'N/A',
      riskFlags: [],
      missingInfo: [],
      assumptions: [],
      unverifiableInfo: [],
      previewSummary: {},
      fullAnalysis: {}
    });
    res.json({ id: run._id, score: run.score, signal: run.signal, reused: false });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Quick score error' });
  }
};

export const parselInsight = async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const property = await PropertySubmission.findOne({ _id: req.params.propertyId, userId });
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  // Minimal placeholder response
  res.json({ id: property._id, message: 'Not implemented' });
};

export const developerFit = async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const property = await PropertySubmission.findOne({ _id: req.params.propertyId, userId });
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  // Minimal placeholder response
  res.json({ id: property._id, message: 'Not implemented' });
};
