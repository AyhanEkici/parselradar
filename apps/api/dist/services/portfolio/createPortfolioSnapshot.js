"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPortfolioSnapshot = createPortfolioSnapshot;
function createPortfolioSnapshot(input) {
    return {
        portfolio: input.portfolio,
        itemCount: input.items.length,
        items: input.items,
        latestAnalyses: input.latestAnalyses,
        generatedAt: new Date().toISOString(),
    };
}
