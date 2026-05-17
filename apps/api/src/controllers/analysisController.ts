// FULL FILE REPLACEMENT: Minimal, compile-safe, contract-matching implementation

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import PropertySubmission from '../models/PropertySubmission';
import AnalysisRun from '../models/AnalysisRun';
import DocumentUpload from '../models/DocumentUpload';
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
  const assessment = {
    baseScore: 0,
    strengths: [] as string[],
    risks: [] as string[],
    missingInputs: [] as string[],
    factorsUsed: {} as Record<string, number | string>,
  };

  // Price and market factors (max 25 points)
  if (property.askingPriceTRY && property.askingPriceTRY > 0) {
    assessment.baseScore += 15;
    assessment.strengths.push('Asking price provided');
    assessment.factorsUsed['askingPriceTRY'] = property.askingPriceTRY;
  } else {
    assessment.missingInputs.push('Asking price');
    assessment.risks.push('No price benchmark available');
  }

  if (property.pricePerM2 && property.pricePerM2 > 0) {
    assessment.baseScore += 10;
    assessment.factorsUsed['pricePerM2'] = property.pricePerM2;
    const pricePerM2 = property.pricePerM2;
    if (pricePerM2 < 5000) {
      assessment.strengths.push('Unit price appears competitive');
    } else if (pricePerM2 > 50000) {
      assessment.risks.push('Unit price significantly above typical market');
    }
  } else if (property.askingPriceTRY && property.areaM2) {
    assessment.risks.push('Cannot calculate unit price (area/price mismatch)');
  }

  // Area and size factors (max 20 points)
  if (property.areaM2 && property.areaM2 > 0) {
    assessment.baseScore += 12;
    assessment.strengths.push('Area documented');
    assessment.factorsUsed['areaM2'] = property.areaM2;
    if (property.areaM2 < 50) {
      assessment.risks.push('Small parcel size may limit development options');
    } else if (property.areaM2 > 50000) {
      assessment.risks.push('Large parcel requires specialized marketing');
    }
  } else {
    assessment.missingInputs.push('Parcel area');
    assessment.risks.push('Area uncertainty');
  }

  // Title deed and parcel identification (max 25 points)
  if (property.tapuType && property.tapuType !== 'UNKNOWN') {
    assessment.baseScore += 8;
    assessment.factorsUsed['tapuType'] = property.tapuType;
    if (property.tapuType.includes('KAT_MULKIYETI')) {
      assessment.strengths.push('Individual apartment title (simplified ownership)');
    } else if (property.tapuType.includes('TAPU')) {
      assessment.strengths.push('Full title deed registered');
    } else {
      assessment.risks.push(`Title type ${property.tapuType} requires verification`);
    }
  } else {
    assessment.missingInputs.push('Title deed type');
    assessment.risks.push('No title information available');
  }

  if (property.ada) {
    assessment.baseScore += 8;
    assessment.strengths.push('Cadastral block (ada) identified');
    assessment.factorsUsed['ada'] = property.ada;
  } else {
    assessment.missingInputs.push('Cadastral block (ada)');
  }

  if (property.parsel) {
    assessment.baseScore += 9;
    assessment.strengths.push('Parcel number (parsel) identified');
    assessment.factorsUsed['parsel'] = property.parsel;
  } else {
    assessment.missingInputs.push('Parcel number (parsel)');
  }

  // Zoning and land use (max 15 points)
  if (property.zoningStatus && !property.zoningStatus.toString().toUpperCase().includes('UNKNOWN')) {
    assessment.baseScore += 12;
    assessment.factorsUsed['zoningStatus'] = property.zoningStatus;
    const zoning = property.zoningStatus.toString().toUpperCase();
    if (zoning.includes('RESIDENTIAL') || zoning.includes('COMMERCIAL') || zoning.includes('MIXED')) {
      assessment.strengths.push('Clear zoning status');
    } else if (zoning.includes('AGRICULTURAL')) {
      assessment.risks.push('Agricultural zoning may limit commercial development');
    } else if (zoning.includes('GREEN') || zoning.includes('PROTECTED')) {
      assessment.risks.push('Protected/green zone may restrict development');
    }
  } else {
    assessment.missingInputs.push('Zoning classification');
    assessment.risks.push('Zoning status uncertain');
  }

  // Infrastructure and utilities (max 10 points)
  if (property.roadAccess && property.roadAccess !== 'UNKNOWN') {
    assessment.baseScore += 5;
    assessment.factorsUsed['roadAccess'] = property.roadAccess;
    if (!property.roadAccess.toString().toUpperCase().includes('NO') && !property.roadAccess.toString().toUpperCase().includes('NONE')) {
      assessment.strengths.push('Road access available');
    } else {
      assessment.risks.push('Limited or no direct road access');
    }
  } else {
    assessment.missingInputs.push('Road access');
  }

  if (property.electricity) {
    assessment.baseScore += 2;
    assessment.factorsUsed['electricity'] = property.electricity;
    if (!property.electricity.toString().toUpperCase().includes('NO') && !property.electricity.toString().toUpperCase().includes('NONE')) {
      assessment.strengths.push('Electricity available');
    } else {
      assessment.risks.push('No electricity connection');
    }
  }

  if (property.water) {
    assessment.baseScore += 3;
    assessment.factorsUsed['water'] = property.water;
    if (!property.water.toString().toUpperCase().includes('NO') && !property.water.toString().toUpperCase().includes('NONE')) {
      assessment.strengths.push('Water available');
    } else {
      assessment.risks.push('No water connection');
    }
  }

  // Documentation and verification (max 5 points)
  const docCount = (property._documentCount || 0);
  if (docCount > 0) {
    const docBonus = Math.min(5, docCount);
    assessment.baseScore += docBonus;
    assessment.factorsUsed['uploadedDocuments'] = docCount;
    if (docCount >= 3) {
      assessment.strengths.push(`${docCount} supporting documents uploaded`);
    } else {
      assessment.risks.push(`Only ${docCount} document(s) uploaded; more documentation recommended`);
    }
  } else {
    assessment.missingInputs.push('Supporting documents');
    assessment.risks.push('No documents uploaded for verification');
  }

  // Cap score at 100 and compute signal
  let score = Math.min(100, Math.max(0, assessment.baseScore));

  // Penalty for high missing inputs
  const missingCount = assessment.missingInputs.length;
  if (missingCount > 4) {
    score = Math.max(0, score - (missingCount - 4) * 8);
  }

  // Compute signal based on score and risk count
  let signal = 'MODERATE';
  if (score >= 80 && assessment.risks.length <= 2) {
    signal = 'STRONG';
  } else if (score >= 60 && assessment.risks.length <= 3) {
    signal = 'MODERATE';
  } else if (score >= 40) {
    signal = 'WEAK';
  } else {
    signal = 'NEEDS_REVIEW';
  }

  // Confidence: inverse of missing inputs
  const confidence = Math.max(20, 100 - missingCount * 15);

  // Generate summary and recommendation
  const recommendation =
    signal === 'STRONG'
      ? 'Sufficient data for preliminary assessment. Consider proceeding with technical review.'
      : signal === 'MODERATE'
      ? 'Additional documentation recommended before detailed evaluation.'
      : signal === 'WEAK'
      ? 'Gather missing information before proceeding with analysis.'
      : 'Comprehensive data collection required. Cannot proceed with reliable assessment.';

  const summary =
    signal === 'STRONG'
      ? `Strong data profile (${score} pts): Core property details well documented. Low missing-data risk.`
      : signal === 'MODERATE'
      ? `Moderate data profile (${score} pts): Key details available. ${missingCount} information gaps identified.`
      : signal === 'WEAK'
      ? `Weak data profile (${score} pts): Significant information gaps (${missingCount}). Detailed documentation needed.`
      : `Insufficient data profile (${score} pts): Cannot reliably assess property. Critical information missing.`;

  return { score, signal, strengths: assessment.strengths, risks: assessment.risks, missingInputs: assessment.missingInputs, factorsUsed: assessment.factorsUsed, confidence, summary, recommendation };
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
      confidence: existingRun.confidence,
      reused: true,
      summary: (existingRun.previewSummary as any)?.summary || 'Existing quick-score reused.',
      strengths: existingRun.strengths || [],
      risks: existingRun.risks || [],
      missingInputs: existingRun.missingInputs || [],
      recommendation: existingRun.recommendation || '',
      factorsUsed: existingRun.factorsUsed || {},
      createdAt: existingRun.createdAt,
      message: 'Idempotent: existing quick-score result reused.'
    });
  }
  try {
    await deductCredits(normalizeUserId(userId), COSTS.quick);
    
    // Get document count
    const docCount = await DocumentUpload.countDocuments({ propertySubmissionId: property._id });
    const propWithDocs = { ...property.toObject(), _documentCount: docCount };
    
    const assessment = buildQuickAssessment(propWithDocs);
    const run = await AnalysisRun.create({
      propertySubmissionId: property._id,
      userId,
      productType: 'QUICK_SCORE',
      score: assessment.score,
      signal: assessment.signal,
      confidence: assessment.confidence,
      strengths: assessment.strengths,
      risks: assessment.risks,
      riskFlags: assessment.risks,
      missingInputs: assessment.missingInputs,
      missingInfo: assessment.missingInputs,
      assumptions: [],
      unverifiableInfo: [],
      factorsUsed: assessment.factorsUsed,
      recommendation: assessment.recommendation,
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
      metadata: { propertyId: property._id.toString(), score: assessment.score, signal: assessment.signal },
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
    });
    res.json({
      id: run._id,
      score: run.score,
      signal: run.signal,
      confidence: run.confidence,
      reused: false,
      summary: assessment.summary,
      strengths: assessment.strengths,
      risks: assessment.risks,
      missingInputs: assessment.missingInputs,
      recommendation: assessment.recommendation,
      factorsUsed: assessment.factorsUsed,
      createdAt: run.createdAt,
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
