"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRegionalDemand = calculateRegionalDemand;
const regionalDemandMatrix_1 = require("../../config/geo/regionalDemandMatrix");
function normalize(value) {
    return (value || '').trim().toLowerCase();
}
function calculateRegionalDemand(city, district, zoning) {
    const normalizedCity = normalize(city);
    const normalizedDistrict = normalize(district);
    const normalizedZoning = normalize(zoning);
    let match = regionalDemandMatrix_1.REGIONAL_DEMAND_MATRIX.find((entry) => normalize(entry.city) === normalizedCity && (!entry.district || normalize(entry.district) === normalizedDistrict));
    if (!match) {
        match = regionalDemandMatrix_1.REGIONAL_DEMAND_MATRIX.find((entry) => normalize(entry.city) === normalizedCity);
    }
    if (!match) {
        return { demandLevel: 'stable', demandScore: 60 };
    }
    let demandScore = regionalDemandMatrix_1.DEMAND_LEVEL_SCORES[match.demandLevel];
    if (normalizedZoning.includes('konut') || normalizedZoning.includes('residential')) {
        demandScore = Math.round(demandScore * 0.9 + (match.residentialDemand || 0) * 0.1);
    }
    else if (normalizedZoning.includes('ticari') || normalizedZoning.includes('commercial')) {
        demandScore = Math.round(demandScore * 0.9 + (match.commercialDemand || 0) * 0.1);
    }
    else if (normalizedZoning.includes('sanayi') || normalizedZoning.includes('industrial')) {
        demandScore = Math.round(demandScore * 0.9 + (match.industrialDemand || 0) * 0.1);
    }
    return {
        demandLevel: match.demandLevel,
        demandScore,
        residentialDemand: match.residentialDemand,
        commercialDemand: match.commercialDemand,
        industrialDemand: match.industrialDemand,
    };
}
