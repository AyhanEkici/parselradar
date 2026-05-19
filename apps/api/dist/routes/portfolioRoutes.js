"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const portfolioController_1 = require("../controllers/portfolioController");
const router = express_1.default.Router();
router.get('/portfolio', auth_1.auth, portfolioController_1.getPortfolios);
router.post('/portfolio', auth_1.auth, portfolioController_1.createPortfolio);
router.get('/portfolio/:id', auth_1.auth, portfolioController_1.getPortfolioById);
router.post('/portfolio/:id/items', auth_1.auth, portfolioController_1.addPortfolioItem);
router.delete('/portfolio/:id/items/:itemId', auth_1.auth, portfolioController_1.deletePortfolioItem);
exports.default = router;
