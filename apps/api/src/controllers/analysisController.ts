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

function normalizeUserId(userId: unknown) {
  if (typeof userId === 'string') return new mongoose.Types.ObjectId(userId);
  return userId as mongoose.Types.ObjectId;
}

function buildQuickAssessment(property: any) {
  let score = 45;
  const riskFlags: string[] = [];
  const missingInfo: string[] = [];

  if (property.askingPriceTRY && property.askingPriceTRY > 0) score += 12;
  else missingInfo.push('Fiyat bilgisi eksik');

  if (property.areaM2 && property.areaM2 > 0) score += 10;
  else missingInfo.push('Alan bilgisi eksik');

  if (property.ada) score += 8;
  else missingInfo.push('Ada bilgisi eksik');

  if (property.parsel) score += 8;
  else missingInfo.push('Parsel bilgisi eksik');

  if (!property.addressText) {
    riskFlags.push('Adres detayı sınırlı');
  } else {
    score += 5;
  }

  if (property.zoningStatus?.toString().toUpperCase().includes('UNKNOWN')) {
    riskFlags.push('İmar durumu net değil');
  }

  if (score > 100) score = 100;
  if (score < 0) score = 0;

  const signal = score >= 75 ? 'HIGH' : score >= 55 ? 'MEDIUM' : 'LOW';
  const summary =
    signal === 'HIGH'
      ? 'Temel alan/fiyat/parsel verisi güçlü. Detaylı doğrulama önerilir.'
      : signal === 'MEDIUM'
      ? 'Temel sinyaller orta seviyede. Eksik verileri tamamlayın.'
      : 'Veri eksiklikleri yüksek. Belge ve parsel bilgisini tamamlayın.';

  return { score, signal, riskFlags, missingInfo, summary };
}

export const quickScore = async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const force = req.query.force === '1' || req.query.force === 'true';
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
  const existingRun = await AnalysisRun.findOne({ propertySubmissionId: property._id, userId, productType: 'QUICK_SCORE' })
    .sort({ createdAt: -1 });
  if (existingRun && !force) {
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
      summary: (existingRun.previewSummary as any)?.summary || 'Mevcut hızlı analiz sonucu tekrar kullanıldı.',
      createdAt: existingRun.createdAt,
      message: 'Idempotent: existing quick-score result reused.'
    });
  }
  try {
    await deductCredits(normalizeUserId(userId), COSTS.quick);
    const assessment = buildQuickAssessment(property);
    const run = await AnalysisRun.create({
      propertySubmissionId: property._id,
      userId,
      productType: 'QUICK_SCORE',
      score: assessment.score,
      signal: assessment.signal,
      riskFlags: assessment.riskFlags,
      missingInfo: assessment.missingInfo,
      assumptions: [],
      unverifiableInfo: [],
      previewSummary: { summary: assessment.summary, reused: false },
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
    res.json({
      id: run._id,
      score: run.score,
      signal: run.signal,
      reused: false,
      summary: (run.previewSummary as any)?.summary || '-',
      createdAt: run.createdAt,
      topRisks: run.riskFlags,
      missingDocs: run.missingInfo,
      recommendedAction: run.signal === 'HIGH' ? 'Detaylı teknik incelemeye geçin.' : 'Eksik belge ve verileri tamamlayın.',
    });
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
  const existingRun = await AnalysisRun.findOne({ propertySubmissionId: property._id, userId, productType: 'PARSEL_INSIGHT' })
    .sort({ createdAt: -1 });
  if (existingRun) {
    return res.json({
      id: existingRun._id,
      score: existingRun.score,
      signal: existingRun.signal,
      reused: true,
      summary: (existingRun.previewSummary as any)?.summary || 'Mevcut parsel analizi kullanıldı.',
      createdAt: existingRun.createdAt,
      topRisks: existingRun.riskFlags,
      missingDocs: existingRun.missingInfo,
      recommendedAction: 'Tapu ve belediye doğrulamasını ilerletin.',
    });
  }

  const missingInfo: string[] = [];
  if (!property.ada) missingInfo.push('Ada bilgisi eksik');
  if (!property.parsel) missingInfo.push('Parsel bilgisi eksik');
  if (!property.pafta) missingInfo.push('Pafta bilgisi eksik');
  const score = Math.max(30, 85 - missingInfo.length * 15);
  const signal = score >= 70 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW';
  const summary = missingInfo.length === 0
    ? 'Parsel verisi detaylı görünüyor.'
    : 'Parsel verisinde eksikler var. Belediyeden tamamlayıcı doküman alın.';

  const run = await AnalysisRun.create({
    propertySubmissionId: property._id,
    userId,
    productType: 'PARSEL_INSIGHT',
    score,
    signal,
    riskFlags: missingInfo.length ? ['Parsel verisi eksik'] : [],
    missingInfo,
    assumptions: [],
    unverifiableInfo: [],
    previewSummary: { summary, reused: false },
    fullAnalysis: {},
  });

  res.json({
    id: run._id,
    score: run.score,
    signal: run.signal,
    reused: false,
    summary,
    createdAt: run.createdAt,
    topRisks: run.riskFlags,
    missingDocs: run.missingInfo,
    recommendedAction: 'Tapu kayıtlarıyla parsel alanını doğrulayın.',
  });
};

export const developerFit = async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const property = await PropertySubmission.findOne({ _id: req.params.propertyId, userId });
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  const existingRun = await AnalysisRun.findOne({ propertySubmissionId: property._id, userId, productType: 'DEVELOPER_FIT' })
    .sort({ createdAt: -1 });
  if (existingRun) {
    return res.json({
      id: existingRun._id,
      score: existingRun.score,
      signal: existingRun.signal,
      reused: true,
      summary: (existingRun.previewSummary as any)?.summary || 'Mevcut developer fit sonucu kullanıldı.',
      createdAt: existingRun.createdAt,
      topRisks: existingRun.riskFlags,
      missingDocs: existingRun.missingInfo,
      recommendedAction: 'Geliştirici perspektifinden fizibiliteyi derinleştirin.',
    });
  }

  const hasStrongZoning = Boolean(property.zoningStatus && property.zoningStatus !== 'UNKNOWN');
  const hasParcelData = Boolean(property.ada && property.parsel);
  const hasPrice = Boolean(property.askingPriceTRY && property.askingPriceTRY > 0);
  const score = (hasStrongZoning ? 35 : 15) + (hasParcelData ? 35 : 15) + (hasPrice ? 30 : 10);
  const signal = score >= 75 ? 'HIGH' : score >= 55 ? 'MEDIUM' : 'LOW';
  const missingInfo: string[] = [];
  if (!hasStrongZoning) missingInfo.push('İmar detayı net değil');
  if (!hasParcelData) missingInfo.push('Ada/Parsel eksik');
  if (!hasPrice) missingInfo.push('Fiyat bilgisi eksik');
  const summary = signal === 'HIGH'
    ? 'Geliştirici uyumu yüksek görünüyor.'
    : 'Geliştirici uyumu için kritik veri eksikleri var.';

  const run = await AnalysisRun.create({
    propertySubmissionId: property._id,
    userId,
    productType: 'DEVELOPER_FIT',
    score,
    signal,
    riskFlags: missingInfo.length ? ['Geliştirici değerlendirmesi için veri eksik'] : [],
    missingInfo,
    assumptions: [],
    unverifiableInfo: [],
    previewSummary: { summary, reused: false },
    fullAnalysis: {},
  });

  res.json({
    id: run._id,
    score: run.score,
    signal: run.signal,
    reused: false,
    summary,
    createdAt: run.createdAt,
    topRisks: run.riskFlags,
    missingDocs: run.missingInfo,
    recommendedAction: 'Parsel ve imar verilerini yatırım senaryosuyla birlikte doğrulayın.',
  });
};
