"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFrontageDepthScore = calculateFrontageDepthScore;
const frontageDepthWeights_1 = require("../../config/development/frontageDepthWeights");
function roadKey(roadAccess) {
    const value = (roadAccess || '').toLowerCase();
    if (value.includes('highway') || value.includes('otoyol'))
        return 'highway';
    if (value.includes('anayol') || value.includes('bulvar'))
        return 'anayol';
    if (value.includes('arter') || value.includes('cadde'))
        return 'arterial';
    if (value.includes('village') || value.includes('koy') || value.includes('köy'))
        return 'village';
    if (value.trim())
        return 'local';
    return 'unknown';
}
function calculateFrontageDepthScore(input) {
    const area = input.areaM2 || 0;
    const text = `${input.addressText || ''} ${input.mahalleOrKoy || ''}`.toLowerCase();
    const signals = [];
    let score = frontageDepthWeights_1.FRONTAGE_DEPTH_WEIGHTS.baseScore;
    score += frontageDepthWeights_1.FRONTAGE_DEPTH_WEIGHTS.roadAccessBonus[roadKey(input.roadAccess)];
    if (area <= frontageDepthWeights_1.FRONTAGE_DEPTH_WEIGHTS.areaBands.compact.max) {
        score += frontageDepthWeights_1.FRONTAGE_DEPTH_WEIGHTS.areaBands.compact.score;
        signals.push('compact_geometry');
    }
    else if (area <= frontageDepthWeights_1.FRONTAGE_DEPTH_WEIGHTS.areaBands.balanced.max) {
        score += frontageDepthWeights_1.FRONTAGE_DEPTH_WEIGHTS.areaBands.balanced.score;
        signals.push('balanced_depth_ratio_proxy');
    }
    else if (area <= frontageDepthWeights_1.FRONTAGE_DEPTH_WEIGHTS.areaBands.deep.max) {
        score += frontageDepthWeights_1.FRONTAGE_DEPTH_WEIGHTS.areaBands.deep.score;
        signals.push('deep_lot_proxy');
    }
    else {
        score += frontageDepthWeights_1.FRONTAGE_DEPTH_WEIGHTS.areaBands.oversized.score;
        signals.push('oversized_depth_penalty');
    }
    if (frontageDepthWeights_1.GEOMETRY_HEURISTIC_KEYWORDS.corner.some((keyword) => text.includes(keyword))) {
        score += frontageDepthWeights_1.FRONTAGE_DEPTH_WEIGHTS.cornerKeywordBonus;
        signals.push('corner_opportunity_bonus');
    }
    if (frontageDepthWeights_1.GEOMETRY_HEURISTIC_KEYWORDS.narrow.some((keyword) => text.includes(keyword))) {
        score += frontageDepthWeights_1.FRONTAGE_DEPTH_WEIGHTS.narrowKeywordPenalty;
        signals.push('narrow_parcel_penalty');
    }
    if (frontageDepthWeights_1.GEOMETRY_HEURISTIC_KEYWORDS.deep.some((keyword) => text.includes(keyword)) || area > 4000) {
        score += frontageDepthWeights_1.FRONTAGE_DEPTH_WEIGHTS.deepShapePenalty;
        signals.push('deep_parcel_penalty');
    }
    return {
        score: Math.max(0, Math.min(100, Math.round(score))),
        geometrySignals: signals,
    };
}
