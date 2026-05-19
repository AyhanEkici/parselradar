"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const investorController_1 = require("../controllers/investorController");
const router = express_1.default.Router();
router.get('/dashboard', auth_1.auth, investorController_1.getInvestorDashboard);
router.get('/saved-analyses', auth_1.auth, investorController_1.getSavedAnalyses);
router.post('/saved-analyses', auth_1.auth, investorController_1.createSavedAnalysis);
router.delete('/saved-analyses/:id', auth_1.auth, investorController_1.deleteSavedAnalysis);
router.get('/watchlist', auth_1.auth, investorController_1.getWatchlist);
router.post('/watchlist', auth_1.auth, investorController_1.createWatchlistItem);
router.delete('/watchlist/:id', auth_1.auth, investorController_1.deleteWatchlistItem);
exports.default = router;
