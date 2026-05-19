"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectInvestmentOpportunity = detectInvestmentOpportunity;
function detectInvestmentOpportunity(input) {
    const signals = [];
    if (input.pricingPosition === 'UNDER_MARKET') {
        signals.push('undervalued candidate');
    }
    if ((input.developerFit || '').toUpperCase().includes('HIGH')) {
        signals.push('developer opportunity');
    }
    if (typeof input.infrastructureScore === 'number' && input.infrastructureScore >= 70) {
        signals.push('infrastructure upside');
    }
    const liquidityUpper = (input.liquiditySignal || '').toUpperCase();
    if (liquidityUpper.includes('HIGH') || input.marketHeat === 'ACTIVE' || input.marketHeat === 'HOT') {
        signals.push('liquidity upside');
    }
    return Array.from(new Set(signals));
}
