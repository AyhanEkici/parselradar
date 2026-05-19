"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePortfolioExposure = calculatePortfolioExposure;
function calculatePortfolioExposure(input) {
    const totalWeight = input.items.reduce((sum, item) => sum + (item.allocationWeight || 0), 0);
    const totalValue = input.items.reduce((sum, item) => sum + (item.askingPriceTRY || 0), 0);
    const byCity = {};
    input.items.forEach((item) => {
        const key = String(item.il || 'unknown').toLowerCase();
        byCity[key] = (byCity[key] || 0) + (item.askingPriceTRY || 0);
    });
    return {
        totalWeight,
        totalValue,
        byCity,
        itemCount: input.items.length,
    };
}
