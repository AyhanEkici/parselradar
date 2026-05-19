"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectParcelMergeOpportunity = detectParcelMergeOpportunity;
const parcelMergeRules_1 = require("../../config/development/parcelMergeRules");
function zoningKey(zoningStatus) {
    const value = (zoningStatus || '').toLowerCase();
    if (value.includes('sanayi') || value.includes('industrial'))
        return 'industrial';
    if (value.includes('ticari') || value.includes('commercial') || value.includes('karma') || value.includes('mixed'))
        return 'mixed';
    if (value.includes('turizm') || value.includes('tourism'))
        return 'tourism';
    return 'residential';
}
function detectParcelMergeOpportunity(input) {
    const area = input.areaM2 || 0;
    const district = (input.district || '').toLowerCase();
    const signals = [];
    let score = 28;
    if (area >= parcelMergeRules_1.PARCEL_MERGE_RULES.minimumAssemblyAreaM2) {
        score += 24;
        signals.push('assembly_scale_possible');
    }
    if (area >= parcelMergeRules_1.PARCEL_MERGE_RULES.expansionAreaThresholdM2) {
        score += 18;
        signals.push('expansion_scale_possible');
    }
    score += parcelMergeRules_1.PARCEL_MERGE_RULES.districtAggregationBonuses[district] || 0;
    score += parcelMergeRules_1.PARCEL_MERGE_RULES.zoningBonuses[zoningKey(input.zoningStatus)];
    const bounded = Math.max(0, Math.min(100, Math.round(score)));
    const level = bounded >= 78 ? 'expansion' : bounded >= 56 ? 'assembly' : 'limited';
    return {
        score: bounded,
        level,
        signals,
    };
}
