"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const portfolioAnalyticsController_1 = require("../controllers/portfolioAnalyticsController");
const router = express_1.default.Router();
router.get('/portfolio/:id/analytics', auth_1.auth, portfolioAnalyticsController_1.getPortfolioAnalytics);
router.get('/portfolio/:id/benchmark', auth_1.auth, portfolioAnalyticsController_1.getPortfolioBenchmark);
router.get('/portfolio/:id/scenarios', auth_1.auth, portfolioAnalyticsController_1.getPortfolioScenarios);
router.get('/portfolio/:id/exposure', auth_1.auth, portfolioAnalyticsController_1.getPortfolioExposure);
router.get('/portfolio/:id/performance', auth_1.auth, portfolioAnalyticsController_1.getPortfolioPerformance);
exports.default = router;
