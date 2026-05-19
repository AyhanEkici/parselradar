"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInvestorNotifications = buildInvestorNotifications;
function buildInvestorNotifications(input) {
    const notifications = [];
    const signal = String(input.investorSignal || 'CAUTION').toUpperCase();
    if (signal === 'BULLISH') {
        notifications.push({
            level: 'action',
            title: 'Bullish setup detected',
            message: `Opportunity score ${input.opportunityScore || 0} with volatility ${input.volatilityIndex || 0}.`,
        });
    }
    else if (signal === 'WATCH') {
        notifications.push({
            level: 'watch',
            title: 'Watchlist condition',
            message: 'Momentum and heat are balanced; monitor connector freshness for next decision.',
        });
    }
    else {
        notifications.push({
            level: 'info',
            title: 'Caution signal',
            message: 'Risk-adjusted opportunity is limited under current deterministic inputs.',
        });
    }
    if ((input.alertSignals || []).includes('market_momentum_shift_detected')) {
        notifications.push({
            level: 'watch',
            title: 'Momentum shift',
            message: 'District momentum changed significantly versus baseline snapshot.',
        });
    }
    return notifications;
}
