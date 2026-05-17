import express from 'express';
import { auth } from '../middleware/auth';
import {
  addPortfolioItem,
  createPortfolio,
  deletePortfolioItem,
  getPortfolioById,
  getPortfolios,
} from '../controllers/portfolioController';

const router = express.Router();

router.get('/portfolio', auth, getPortfolios);
router.post('/portfolio', auth, createPortfolio);
router.get('/portfolio/:id', auth, getPortfolioById);
router.post('/portfolio/:id/items', auth, addPortfolioItem);
router.delete('/portfolio/:id/items/:itemId', auth, deletePortfolioItem);

export default router;
