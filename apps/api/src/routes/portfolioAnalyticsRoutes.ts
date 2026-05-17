import express from 'express';
import { auth } from '../middleware/auth';
import {
  getPortfolioAnalytics,
  getPortfolioBenchmark,
  getPortfolioExposure,
  getPortfolioPerformance,
  getPortfolioScenarios,
} from '../controllers/portfolioAnalyticsController';

const router = express.Router();

router.get('/portfolio/:id/analytics', auth, getPortfolioAnalytics);
router.get('/portfolio/:id/benchmark', auth, getPortfolioBenchmark);
router.get('/portfolio/:id/scenarios', auth, getPortfolioScenarios);
router.get('/portfolio/:id/exposure', auth, getPortfolioExposure);
router.get('/portfolio/:id/performance', auth, getPortfolioPerformance);

export default router;
