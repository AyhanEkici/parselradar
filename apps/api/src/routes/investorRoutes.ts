import express from 'express';
import { auth } from '../middleware/auth';
import {
  createSavedAnalysis,
  createWatchlistItem,
  deleteSavedAnalysis,
  deleteWatchlistItem,
  getInvestorDashboard,
  getSavedAnalyses,
  getWatchlist,
} from '../controllers/investorController';

const router = express.Router();

router.get('/dashboard', auth, getInvestorDashboard);
router.get('/saved-analyses', auth, getSavedAnalyses);
router.post('/saved-analyses', auth, createSavedAnalysis);
router.delete('/saved-analyses/:id', auth, deleteSavedAnalysis);

router.get('/watchlist', auth, getWatchlist);
router.post('/watchlist', auth, createWatchlistItem);
router.delete('/watchlist/:id', auth, deleteWatchlistItem);

export default router;
