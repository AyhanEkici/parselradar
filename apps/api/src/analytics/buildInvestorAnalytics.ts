import SavedAnalysis from '../models/SavedAnalysis';
import Watchlist from '../models/Watchlist';
import Portfolio from '../models/Portfolio';
import PortfolioItem from '../models/PortfolioItem';

export async function buildInvestorAnalytics() {
  const [savedAnalyses, watchlistItems, portfolios, portfolioItems] = await Promise.all([
    SavedAnalysis.countDocuments({}),
    Watchlist.countDocuments({ status: 'ACTIVE' }),
    Portfolio.countDocuments({}),
    PortfolioItem.countDocuments({}),
  ]);

  return {
    savedAnalyses,
    watchlistItems,
    portfolios,
    portfolioItems,
    investorState: portfolios > 0 || savedAnalyses > 0 ? 'ACTIVE' : 'READY',
  };
}
