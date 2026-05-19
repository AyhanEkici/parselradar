"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOrganizationExposure = calculateOrganizationExposure;
function calculateOrganizationExposure(input) {
    const portfolioValue = input.portfolios.reduce((sum, row) => sum + (row.askingPriceTRY || 0), 0);
    const watchlistValue = input.watchlist.reduce((sum, row) => sum + (row.askingPriceTRY || 0), 0);
    const cityExposure = {};
    input.portfolios.forEach((row) => {
        const key = String(row.il || 'unknown').toLowerCase();
        cityExposure[key] = (cityExposure[key] || 0) + (row.askingPriceTRY || 0);
    });
    return {
        portfolioValue,
        watchlistValue,
        combinedValue: portfolioValue + watchlistValue,
        cityExposure,
    };
}
