import express from 'express';
import { auth } from '../middleware/auth';
import {
  addWorkspacePortfolioProperty,
  addWorkspaceWatchlistProperty,
  getWorkspaceActivity,
  getWorkspaceDashboard,
  getWorkspacePortfolios,
  getWorkspaceWatchlist,
} from '../controllers/workspaceController';

const router = express.Router();

router.get('/workspace/:organizationId/dashboard', auth, getWorkspaceDashboard);
router.get('/workspace/:organizationId/portfolios', auth, getWorkspacePortfolios);
router.get('/workspace/:organizationId/watchlist', auth, getWorkspaceWatchlist);
router.get('/workspace/:organizationId/activity', auth, getWorkspaceActivity);

router.post('/workspace/:organizationId/portfolios', auth, addWorkspacePortfolioProperty);
router.post('/workspace/:organizationId/watchlist', auth, addWorkspaceWatchlistProperty);

export default router;
