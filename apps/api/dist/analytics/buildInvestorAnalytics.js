"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInvestorAnalytics = buildInvestorAnalytics;
const SavedAnalysis_1 = __importDefault(require("../models/SavedAnalysis"));
const Watchlist_1 = __importDefault(require("../models/Watchlist"));
const Portfolio_1 = __importDefault(require("../models/Portfolio"));
const PortfolioItem_1 = __importDefault(require("../models/PortfolioItem"));
async function buildInvestorAnalytics() {
    const [savedAnalyses, watchlistItems, portfolios, portfolioItems] = await Promise.all([
        SavedAnalysis_1.default.countDocuments({}),
        Watchlist_1.default.countDocuments({ status: 'ACTIVE' }),
        Portfolio_1.default.countDocuments({}),
        PortfolioItem_1.default.countDocuments({}),
    ]);
    return {
        savedAnalyses,
        watchlistItems,
        portfolios,
        portfolioItems,
        investorState: portfolios > 0 || savedAnalyses > 0 ? 'ACTIVE' : 'READY',
    };
}
