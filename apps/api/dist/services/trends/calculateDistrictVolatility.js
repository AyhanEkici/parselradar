"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistrictVolatility = calculateDistrictVolatility;
function calculateDistrictVolatility(input) {
    const acceleration = input.priceAccelerationScore || 0;
    const districtHeat = input.districtHeat || 0;
    const connectorPenalty = Math.min(20, (input.connectorDegradedCount || 0) * 6);
    const volatilityIndex = Math.max(0, Math.min(100, Math.round(acceleration * 0.46 + districtHeat * 0.34 + connectorPenalty + 12)));
    return {
        volatilityIndex,
        volatilityBand: volatilityIndex >= 78 ? 'HIGH' : volatilityIndex >= 62 ? 'ELEVATED' : 'NORMAL',
    };
}
