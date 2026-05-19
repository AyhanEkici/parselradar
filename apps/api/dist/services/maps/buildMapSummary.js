"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMapSummary = buildMapSummary;
function buildMapSummary(input) {
    const infraText = input.nearbyInfrastructure.length > 0
        ? input.nearbyInfrastructure
            .slice(0, 3)
            .map((item) => `${item.name} (${item.distanceKm} km)`)
            .join(', ')
        : 'No nearby configured infrastructure overlays';
    return `Coordinate confidence ${input.geoConfidence.level} (${input.geoConfidence.score}). Nearby infrastructure: ${infraText}. Comparable cluster strength ${input.clusterStrength}. Spatial liquidity ${input.spatialLiquidity.label} (${input.spatialLiquidity.score}). Signals: ${input.spatialSignals.slice(0, 5).join(', ') || 'none'}.`;
}
