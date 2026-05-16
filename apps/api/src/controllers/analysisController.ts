// FULL FILE REPLACEMENT: Minimal, compile-safe, contract-matching implementation

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import PropertySubmission from '../models/PropertySubmission';
import AnalysisRun from '../models/AnalysisRun';
import mongoose from 'mongoose';
import { getUserCredits } from '../utils/credits';
import CreditLedger from '../models/CreditLedger';
import { logAuditEvent } from '../utils/auditLog';

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
  if (!property) {
    await logAuditEvent({
      type: 'analysis_invalid_property',
      actorUserId: userId?.toString(),
      actorRole: req.user?.role,
      targetType: 'PropertySubmission',
      targetId: req.params.propertyId,
      message: 'Invalid property access for quick-score',
      metadata: { propertyId: req.params.propertyId },
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: false,
    });
    return res.status(404).json({ error: 'Mülk bulunamadı' });
  }
  const existingRun = await AnalysisRun.findOne({ propertySubmissionId: property._id, userId, productType: 'QUICK_SCORE' });
  if (existingRun) {
    await logAuditEvent({
      type: 'analysis_quick_score_reused',
      actorUserId: userId?.toString(),
      actorRole: req.user?.role,
      targetType: 'AnalysisRun',
      targetId: existingRun._id.toString(),
      message: 'Quick-score idempotent reuse',
      metadata: { propertyId: property._id.toString() },
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
    });
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
    await logAuditEvent({
      type: 'analysis_quick_score_created',
      actorUserId: userId?.toString(),
      actorRole: req.user?.role,
      targetType: 'AnalysisRun',
      targetId: run._id.toString(),
      message: 'Quick-score created',
      metadata: { propertyId: property._id.toString() },
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
    });
    res.json({ id: run._id, score: run.score, signal: run.signal, reused: false });
  } catch (err: any) {
    if ((err.message || '').toLowerCase().includes('yetersiz kredi')) {
      await logAuditEvent({
        type: 'analysis_insufficient_credits',
        actorUserId: userId?.toString(),
        actorRole: req.user?.role,
        targetType: 'User',
        targetId: userId?.toString(),
        message: 'Insufficient credits for quick-score',
        metadata: { propertyId: property._id.toString() },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: false,
      });
    }
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
