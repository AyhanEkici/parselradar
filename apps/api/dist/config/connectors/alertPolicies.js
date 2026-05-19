"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALERT_POLICIES = void 0;
exports.ALERT_POLICIES = {
    opportunity: {
        minOpportunityScore: 72,
        maxVolatilityForStrongBuy: 68,
    },
    marketShift: {
        minMomentumShift: 16,
        minVolatilitySpike: 10,
    },
    infrastructure: {
        minInfrastructureImpact: 60,
    },
};
