"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findComparableParcels = findComparableParcels;
const districtMultipliers_1 = require("../../config/analysis/districtMultipliers");
const valuationMatrix_1 = require("../../config/analysis/valuationMatrix");
function normalize(value) {
    return (value || '').trim().toLowerCase();
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function toPricePerM2(record) {
    if (typeof record.pricePerM2 === 'number' && record.pricePerM2 > 0)
        return record.pricePerM2;
    if (typeof record.askingPriceTRY === 'number' && record.askingPriceTRY > 0 && typeof record.areaM2 === 'number' && record.areaM2 > 0) {
        return record.askingPriceTRY / record.areaM2;
    }
    const cityKey = normalize(record.il);
    return valuationMatrix_1.REGION_VALUATION_MATRIX[cityKey]?.basePricePerM2 || valuationMatrix_1.REGION_VALUATION_MATRIX.default.basePricePerM2;
}
function districtMultiplier(value) {
    const district = normalize(value);
    if (!district)
        return districtMultipliers_1.DEFAULT_DISTRICT_MULTIPLIER;
    if (districtMultipliers_1.DISTRICT_KEYWORD_MULTIPLIERS.premium.keywords.some((k) => district.includes(k))) {
        return districtMultipliers_1.DISTRICT_KEYWORD_MULTIPLIERS.premium.multiplier;
    }
    if (districtMultipliers_1.DISTRICT_KEYWORD_MULTIPLIERS.rural.keywords.some((k) => district.includes(k))) {
        return districtMultipliers_1.DISTRICT_KEYWORD_MULTIPLIERS.rural.multiplier;
    }
    if (districtMultipliers_1.DISTRICT_KEYWORD_MULTIPLIERS.cityEdge.keywords.some((k) => district.includes(k))) {
        return districtMultipliers_1.DISTRICT_KEYWORD_MULTIPLIERS.cityEdge.multiplier;
    }
    if (districtMultipliers_1.DISTRICT_KEYWORD_MULTIPLIERS.industrial.keywords.some((k) => district.includes(k))) {
        return districtMultipliers_1.DISTRICT_KEYWORD_MULTIPLIERS.industrial.multiplier;
    }
    return districtMultipliers_1.DEFAULT_DISTRICT_MULTIPLIER;
}
function zoningSimilarity(a, b) {
    const left = normalize(a);
    const right = normalize(b);
    if (!left || !right)
        return 0.5;
    if (left === right)
        return 1;
    if (left.includes(right) || right.includes(left))
        return 0.85;
    const sameFamily = (left.includes('konut') && right.includes('residential')) ||
        (left.includes('residential') && right.includes('konut')) ||
        (left.includes('ticari') && right.includes('commercial')) ||
        (left.includes('commercial') && right.includes('ticari'));
    return sameFamily ? 0.72 : 0.3;
}
function infrastructureSimilarity(subject, candidate) {
    const keys = ['roadAccess', 'electricity', 'water'];
    const ratios = keys.map((key) => {
        const left = normalize(subject[key]);
        const right = normalize(candidate[key]);
        if (!left && !right)
            return 0.5;
        if (!left || !right)
            return 0.3;
        return left === right ? 1 : left.includes(right) || right.includes(left) ? 0.8 : 0.2;
    });
    return ratios.reduce((sum, v) => sum + v, 0) / ratios.length;
}
function daysSince(dateValue, nowMs) {
    if (!dateValue)
        return 365;
    const dt = new Date(dateValue);
    if (Number.isNaN(dt.getTime()))
        return 365;
    const diffMs = (typeof nowMs === 'number' ? nowMs : Date.now()) - dt.getTime();
    return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}
function recencyWeight(days) {
    if (days <= 30)
        return 1;
    if (days <= 90)
        return 0.8;
    if (days <= 180)
        return 0.62;
    if (days <= 365)
        return 0.42;
    return 0.25;
}
function areaSimilarity(subjectArea, candidateArea) {
    if (!subjectArea || !candidateArea || subjectArea <= 0 || candidateArea <= 0)
        return 0.55;
    const ratio = Math.abs(subjectArea - candidateArea) / Math.max(subjectArea, candidateArea);
    return clamp(1 - ratio, 0, 1);
}
function priceClusterSimilarity(subjectPpm2, candidatePpm2) {
    const ratio = Math.abs(subjectPpm2 - candidatePpm2) / Math.max(subjectPpm2, candidatePpm2, 1);
    return clamp(1 - ratio, 0, 1);
}
function findComparableParcels(input) {
    const maxResults = input.maxResults || 8;
    const nowMs = typeof input.nowMs === 'number' ? input.nowMs : Date.now();
    const subjectPricePerM2 = toPricePerM2(input.subject);
    const subjectCity = normalize(input.subject.il);
    const subjectDistrict = normalize(input.subject.ilce);
    const subjectDistrictMultiplier = districtMultiplier(input.subject.ilce);
    const candidates = input.candidates.filter((candidate) => String(candidate._id) !== String(input.subject._id));
    // Prefer same-city comparables when available (deterministic: based on provided candidate list)
    const sameCityCandidates = subjectCity ? candidates.filter((c) => normalize(c.il) === subjectCity) : [];
    const pool = sameCityCandidates.length >= 6 ? sameCityCandidates : candidates;
    const scored = pool
        .map((candidate) => {
        const candidateCity = normalize(candidate.il);
        const candidateDistrict = normalize(candidate.ilce);
        const candidatePricePerM2 = toPricePerM2(candidate);
        const cityWeight = candidateCity && candidateCity === subjectCity ? 1 : 0;
        const districtExactWeight = candidateDistrict && candidateDistrict === subjectDistrict ? 1 : 0;
        const districtTierWeight = 1 - Math.min(1, Math.abs(subjectDistrictMultiplier - districtMultiplier(candidate.ilce)) / 0.35);
        const cityPenalty = cityWeight === 1 ? 0 : 18;
        const score = cityWeight * 35 +
            Math.max(districtExactWeight, districtTierWeight) * 22 +
            zoningSimilarity(input.subject.zoningStatus, candidate.zoningStatus) * 15 +
            areaSimilarity(input.subject.areaM2, candidate.areaM2) * 10 +
            priceClusterSimilarity(subjectPricePerM2, candidatePricePerM2) * 10 +
            recencyWeight(daysSince(candidate.createdAt, nowMs)) * 5 +
            infrastructureSimilarity(input.subject, candidate) * 3 -
            cityPenalty;
        const days = daysSince(candidate.createdAt, nowMs);
        const deltaRatio = (candidatePricePerM2 - subjectPricePerM2) / Math.max(subjectPricePerM2, 1);
        return {
            ...candidate,
            normalizedPricePerM2: Math.round(candidatePricePerM2),
            similarityScore: Math.round(clamp(score, 0, 100)),
            daysSinceCreated: days,
            priceDeltaRatio: Number(deltaRatio.toFixed(3)),
        };
    })
        .filter((item) => item.similarityScore >= 30)
        .sort((a, b) => {
        if (b.similarityScore !== a.similarityScore)
            return b.similarityScore - a.similarityScore;
        if (a.daysSinceCreated !== b.daysSinceCreated)
            return a.daysSinceCreated - b.daysSinceCreated;
        const aId = String(a._id);
        const bId = String(b._id);
        return aId.localeCompare(bId);
    });
    return scored.slice(0, maxResults);
}
