import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import SavedAnalysis from '../models/SavedAnalysis';
import Watchlist from '../models/Watchlist';
import Portfolio from '../models/Portfolio';
import PortfolioItem from '../models/PortfolioItem';
import AnalysisRun from '../models/AnalysisRun';
import PropertySubmission from '../models/PropertySubmission';
import { buildInvestorDashboardSummary } from '../services/portfolio/buildInvestorDashboardSummary';
import { calculatePortfolioOpportunityScore } from '../services/portfolio/calculatePortfolioOpportunityScore';

function userObjectId(req: AuthRequest) {
  return new mongoose.Types.ObjectId(String(req.user?._id));
}

export const getInvestorDashboard = async (req: AuthRequest, res: Response) => {
  const userId = userObjectId(req);

  const [savedAnalyses, watchlist, portfolios, latestAnalyses] = await Promise.all([
    SavedAnalysis.find({ userId }).lean(),
    Watchlist.find({ userId, status: 'ACTIVE' }).lean(),
    Portfolio.find({ userId }).lean(),
    AnalysisRun.find({ userId }).sort({ createdAt: -1 }).limit(100).lean(),
  ]);

  const opportunity = calculatePortfolioOpportunityScore({
    analyses: latestAnalyses.map((a: any) => ({
      score: a.score,
      opportunityScore: a.fullAnalysis?.opportunityScore,
      freshnessScore: a.fullAnalysis?.freshnessScore,
    })),
  });

  const summary = buildInvestorDashboardSummary({
    savedAnalysesCount: savedAnalyses.length,
    watchlistCount: watchlist.length,
    portfolioCount: portfolios.length,
    averageOpportunityScore: opportunity.averageOpportunity,
    staleIntelligenceCount: opportunity.staleIntelligenceCount,
    highPotentialProperties: opportunity.highPotentialCount,
  });

  return res.json({
    summary,
    confidence: {
      inheritedFromAnalyses: true,
      note: 'All investor intelligence inherits existing sourceConfidence and freshnessScore fields.',
    },
  });
};

export const getSavedAnalyses = async (req: AuthRequest, res: Response) => {
  const userId = userObjectId(req);
  const saved = await SavedAnalysis.find({ userId }).sort({ createdAt: -1 }).lean();
  res.json(saved);
};

export const createSavedAnalysis = async (req: AuthRequest, res: Response) => {
  const userId = userObjectId(req);
  const { propertyId } = req.body as { propertyId?: string };

  if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({ error: 'Geçersiz propertyId' });
  }

  const [property, analysis] = await Promise.all([
    PropertySubmission.findOne({ _id: propertyId, userId }).lean(),
    AnalysisRun.findOne({ propertySubmissionId: propertyId, userId }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });
  if (!analysis) return res.status(404).json({ error: 'Analiz bulunamadı' });

  const created = await SavedAnalysis.findOneAndUpdate(
    {
      userId,
      propertySubmissionId: property._id,
      analysisRunId: analysis._id,
    },
    {
      $setOnInsert: {
        userId,
        propertySubmissionId: property._id,
        analysisRunId: analysis._id,
        title: property.addressText || `${property.il}/${property.ilce}`,
        summary: analysis.previewSummary?.summary || analysis.signal,
        score: analysis.score,
        signal: analysis.signal,
        confidence: analysis.confidence,
        sourceConfidence: analysis.sourceConfidence || analysis.fullAnalysis?.sourceConfidence,
        freshnessScore: analysis.fullAnalysis?.freshnessScore,
        analysisVersion: analysis.analysisVersion || analysis.fullAnalysis?.analysisVersion,
      },
    },
    { new: true, upsert: true }
  ).lean();

  return res.json(created);
};

export const deleteSavedAnalysis = async (req: AuthRequest, res: Response) => {
  const userId = userObjectId(req);
  const doc = await SavedAnalysis.findOneAndDelete({ _id: req.params.id, userId }).lean();
  if (!doc) return res.status(404).json({ error: 'Kayıt bulunamadı' });
  return res.json({ ok: true });
};

export const getWatchlist = async (req: AuthRequest, res: Response) => {
  const userId = userObjectId(req);
  const rows = await Watchlist.find({ userId, status: 'ACTIVE' })
    .sort({ createdAt: -1 })
    .populate('propertySubmissionId', 'addressText il ilce status')
    .lean();

  const enriched = await Promise.all(
    rows.map(async (row: any) => {
      const latest = await AnalysisRun.findOne({ propertySubmissionId: row.propertySubmissionId?._id || row.propertySubmissionId, userId })
        .sort({ createdAt: -1 })
        .lean();
      return {
        ...row,
        latestAnalysis: latest
          ? {
              score: latest.score,
              signal: latest.signal,
              opportunityScore: latest.fullAnalysis?.opportunityScore,
              freshnessScore: latest.fullAnalysis?.freshnessScore,
              sourceConfidence: latest.sourceConfidence || latest.fullAnalysis?.sourceConfidence,
              analysisVersion: latest.analysisVersion || latest.fullAnalysis?.analysisVersion,
            }
          : null,
      };
    })
  );

  return res.json(enriched);
};

export const createWatchlistItem = async (req: AuthRequest, res: Response) => {
  const userId = userObjectId(req);
  const { propertyId } = req.body as { propertyId?: string };

  if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({ error: 'Geçersiz propertyId' });
  }

  const property = await PropertySubmission.findOne({ _id: propertyId, userId }).lean();
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });

  const created = await Watchlist.findOneAndUpdate(
    { userId, propertySubmissionId: property._id },
    { $set: { status: 'ACTIVE' }, $setOnInsert: { userId, propertySubmissionId: property._id } },
    { new: true, upsert: true }
  ).lean();

  return res.json(created);
};

export const deleteWatchlistItem = async (req: AuthRequest, res: Response) => {
  const userId = userObjectId(req);
  const doc = await Watchlist.findOneAndDelete({ _id: req.params.id, userId }).lean();
  if (!doc) return res.status(404).json({ error: 'Kayıt bulunamadı' });
  return res.json({ ok: true });
};

export const getPortfolioSummary = async (req: AuthRequest, res: Response) => {
  const userId = userObjectId(req);
  const [portfolios, items] = await Promise.all([
    Portfolio.find({ userId }).sort({ createdAt: -1 }).lean(),
    PortfolioItem.find({ userId }).lean(),
  ]);

  const counts: Record<string, number> = {};
  items.forEach((item: any) => {
    const key = String(item.portfolioId);
    counts[key] = (counts[key] || 0) + 1;
  });

  return res.json(
    portfolios.map((p: any) => ({
      ...p,
      itemCount: counts[String(p._id)] || 0,
    }))
  );
};
