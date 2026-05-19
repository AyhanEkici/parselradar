import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import Portfolio from '../models/Portfolio';
import PortfolioItem from '../models/PortfolioItem';
import PropertySubmission from '../models/PropertySubmission';
import AnalysisRun from '../models/AnalysisRun';
import { createPortfolioSnapshot } from '../services/portfolio/createPortfolioSnapshot';
import { calculatePortfolioExposure } from '../services/portfolio/calculatePortfolioExposure';
import { calculatePortfolioOpportunityScore } from '../services/portfolio/calculatePortfolioOpportunityScore';

function userObjectId(req: AuthRequest) {
  return new mongoose.Types.ObjectId(String(req.user?._id));
}

export const getPortfolios = async (req: AuthRequest, res: Response) => {
  const userId = userObjectId(req);
  const portfolios = await Portfolio.find({ userId }).sort({ createdAt: -1 }).lean();
  return res.json(portfolios);
};

export const createPortfolio = async (req: AuthRequest, res: Response) => {
  const userId = userObjectId(req);
  const { name, description } = req.body as { name?: string; description?: string };
  if (!name) return res.status(400).json({ error: 'name gerekli' });

  const portfolio = await Portfolio.create({ userId, name, description });
  return res.json(portfolio);
};

export const getPortfolioById = async (req: AuthRequest, res: Response) => {
  const userId = userObjectId(req);
  const portfolio = await Portfolio.findOne({ _id: req.params.id, userId }).lean();
  if (!portfolio) return res.status(404).json({ error: 'Portfolio bulunamadı' });

  const items = await PortfolioItem.find({ portfolioId: portfolio._id, userId }).lean();
  const propertyIds = items.map((i: any) => i.propertySubmissionId);
  const properties = await PropertySubmission.find({ _id: { $in: propertyIds } }).lean();

  const latestAnalyses = await Promise.all(
    propertyIds.map(async (propertyId: any) =>
      AnalysisRun.findOne({ propertySubmissionId: propertyId, userId }).sort({ createdAt: -1 }).lean()
    )
  );

  const analysisByProperty: Record<string, any> = {};
  latestAnalyses.forEach((analysis: any) => {
    if (!analysis) return;
    analysisByProperty[String(analysis.propertySubmissionId)] = analysis;
  });

  const enrichedItems = items.map((item: any) => {
    const property = properties.find((p: any) => String(p._id) === String(item.propertySubmissionId));
    const analysis = analysisByProperty[String(item.propertySubmissionId)];
    return {
      ...item,
      property,
      latestAnalysis: analysis
        ? {
            score: analysis.score,
            signal: analysis.signal,
            opportunityScore: analysis.fullAnalysis?.opportunityScore,
            freshnessScore: analysis.fullAnalysis?.freshnessScore,
            sourceConfidence: analysis.sourceConfidence || analysis.fullAnalysis?.sourceConfidence,
            analysisVersion: analysis.analysisVersion || analysis.fullAnalysis?.analysisVersion,
            autonomyIntelligence: analysis.fullAnalysis?.autonomyIntelligence || null,
            operationalIntelligence: analysis.fullAnalysis?.operationalIntelligence || null,
            ingestionGovernance: analysis.fullAnalysis?.ingestionGovernance || null,
          }
        : null,
    };
  });

  const exposure = calculatePortfolioExposure({
    items: enrichedItems.map((item: any) => ({
      allocationWeight: item.allocationWeight,
      askingPriceTRY: item.property?.askingPriceTRY,
      areaM2: item.property?.areaM2,
      il: item.property?.il,
      ilce: item.property?.ilce,
    })),
  });

  const opportunity = calculatePortfolioOpportunityScore({
    analyses: enrichedItems
      .map((item: any) => item.latestAnalysis)
      .filter(Boolean)
      .map((a: any) => ({
        score: a.score,
        opportunityScore: a.opportunityScore,
        freshnessScore: a.freshnessScore,
      })),
  });

  const snapshot = createPortfolioSnapshot({
    portfolio,
    items: enrichedItems,
    latestAnalyses: enrichedItems.map((item: any) => item.latestAnalysis).filter(Boolean),
  });

  return res.json({ portfolio, items: enrichedItems, exposure, opportunity, snapshot });
};

export const addPortfolioItem = async (req: AuthRequest, res: Response) => {
  const userId = userObjectId(req);
  const portfolio = await Portfolio.findOne({ _id: req.params.id, userId }).lean();
  if (!portfolio) return res.status(404).json({ error: 'Portfolio bulunamadı' });

  const { propertyId, allocationWeight, thesis } = req.body as {
    propertyId?: string;
    allocationWeight?: number;
    thesis?: string;
  };

  if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({ error: 'Geçersiz propertyId' });
  }

  const property = await PropertySubmission.findOne({ _id: propertyId, userId }).lean();
  if (!property) return res.status(404).json({ error: 'Mülk bulunamadı' });

  const item = await PortfolioItem.findOneAndUpdate(
    { userId, portfolioId: portfolio._id, propertySubmissionId: property._id },
    {
      $set: {
        allocationWeight: allocationWeight || 0,
        thesis: thesis || '',
      },
      $setOnInsert: {
        userId,
        portfolioId: portfolio._id,
        propertySubmissionId: property._id,
      },
    },
    { new: true, upsert: true }
  ).lean();

  return res.json(item);
};

export const deletePortfolioItem = async (req: AuthRequest, res: Response) => {
  const userId = userObjectId(req);
  const portfolio = await Portfolio.findOne({ _id: req.params.id, userId }).lean();
  if (!portfolio) return res.status(404).json({ error: 'Portfolio bulunamadı' });

  const deleted = await PortfolioItem.findOneAndDelete({
    _id: req.params.itemId,
    portfolioId: portfolio._id,
    userId,
  }).lean();

  if (!deleted) return res.status(404).json({ error: 'Portfolio item bulunamadı' });
  return res.json({ ok: true });
};
