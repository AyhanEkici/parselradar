"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildComparableSummary = exports.detectOverpricingRisk = exports.detectInvestmentOpportunity = exports.calculateMarketHeat = exports.calculateComparablePricing = exports.findComparableParcels = void 0;
exports.buildComparableMarketIntelligence = buildComparableMarketIntelligence;
const calculateMarketPosition_1 = require("../analysis/calculateMarketPosition");
const calculateMarketHeat_1 = require("./calculateMarketHeat");
const calculateComparablePricing_1 = require("./calculateComparablePricing");
const detectInvestmentOpportunity_1 = require("./detectInvestmentOpportunity");
const detectOverpricingRisk_1 = require("./detectOverpricingRisk");
const buildComparableSummary_1 = require("./buildComparableSummary");
const findComparableParcels_1 = require("./findComparableParcels");
function normalize(value) {
    return (value || '').trim().toLowerCase();
}
function hasNegative(value) {
    const v = normalize(value);
    return v.includes('no') || v.includes('none') || v.includes('yok') || v.includes('uzak');
}
function infrastructureScore(record) {
    let score = 40;
    score += hasNegative(record.roadAccess) ? -20 : 20;
    score += hasNegative(record.electricity) ? -15 : 20;
    score += hasNegative(record.water) ? -15 : 20;
    return Math.max(0, Math.min(100, score));
}
function subjectPricePerM2(subject) {
    const market = (0, calculateMarketPosition_1.calculateMarketPosition)({
        il: subject.il,
        ilce: subject.ilce,
        areaM2: subject.areaM2,
        askingPriceTRY: subject.askingPriceTRY,
        pricePerM2: subject.pricePerM2,
        docCount: 0,
    });
    return market.subjectPricePerM2;
}
function buildComparableMarketIntelligence(input) {
    const topComparables = (0, findComparableParcels_1.findComparableParcels)({
        subject: input.subject,
        candidates: input.candidates,
        maxResults: 8,
        nowMs: input.nowMs,
    });
    const subjectPpm2 = subjectPricePerM2(input.subject);
    const pricing = (0, calculateComparablePricing_1.calculateComparablePricing)({
        subjectPricePerM2: subjectPpm2,
        comparables: topComparables,
    });
    const heat = (0, calculateMarketHeat_1.calculateMarketHeat)({ comparables: topComparables });
    const opportunitySignals = (0, detectInvestmentOpportunity_1.detectInvestmentOpportunity)({
        pricingPosition: pricing.pricingPosition,
        marketHeat: heat.marketHeat,
        developerFit: undefined,
        liquiditySignal: undefined,
        infrastructureScore: infrastructureScore(input.subject),
    });
    const overpricing = (0, detectOverpricingRisk_1.detectOverpricingRisk)({
        pricingPosition: pricing.pricingPosition,
        comparableCount: pricing.comparableCount,
        marketHeat: heat.marketHeat,
        evidenceScore: heat.evidenceScore,
    });
    const comparableSummary = (0, buildComparableSummary_1.buildComparableSummary)({
        comparableCount: pricing.comparableCount,
        avgComparablePricePerM2: pricing.avgComparablePricePerM2,
        pricingPosition: pricing.pricingPosition,
        marketHeat: heat.marketHeat,
        opportunitySignals,
        overpricingRisk: overpricing.overpricingRisk,
    });
    return {
        comparableCount: pricing.comparableCount,
        avgComparablePricePerM2: pricing.avgComparablePricePerM2,
        marketHeat: heat.marketHeat,
        pricingPosition: pricing.pricingPosition,
        opportunitySignals,
        overpricingRisk: overpricing.overpricingRisk,
        comparableSummary,
        topComparables: topComparables.map((c) => ({
            _id: String(c._id),
            il: c.il,
            ilce: c.ilce,
            zoningStatus: c.zoningStatus,
            areaM2: c.areaM2,
            normalizedPricePerM2: c.normalizedPricePerM2,
            similarityScore: c.similarityScore,
            priceDeltaRatio: c.priceDeltaRatio,
            daysSinceCreated: c.daysSinceCreated,
        })),
        riskSignals: overpricing.riskSignals,
        pricingDeltaRatio: pricing.pricingDeltaRatio,
        medianComparablePricePerM2: pricing.medianComparablePricePerM2,
    };
}
var findComparableParcels_2 = require("./findComparableParcels");
Object.defineProperty(exports, "findComparableParcels", { enumerable: true, get: function () { return findComparableParcels_2.findComparableParcels; } });
var calculateComparablePricing_2 = require("./calculateComparablePricing");
Object.defineProperty(exports, "calculateComparablePricing", { enumerable: true, get: function () { return calculateComparablePricing_2.calculateComparablePricing; } });
var calculateMarketHeat_2 = require("./calculateMarketHeat");
Object.defineProperty(exports, "calculateMarketHeat", { enumerable: true, get: function () { return calculateMarketHeat_2.calculateMarketHeat; } });
var detectInvestmentOpportunity_2 = require("./detectInvestmentOpportunity");
Object.defineProperty(exports, "detectInvestmentOpportunity", { enumerable: true, get: function () { return detectInvestmentOpportunity_2.detectInvestmentOpportunity; } });
var detectOverpricingRisk_2 = require("./detectOverpricingRisk");
Object.defineProperty(exports, "detectOverpricingRisk", { enumerable: true, get: function () { return detectOverpricingRisk_2.detectOverpricingRisk; } });
var buildComparableSummary_2 = require("./buildComparableSummary");
Object.defineProperty(exports, "buildComparableSummary", { enumerable: true, get: function () { return buildComparableSummary_2.buildComparableSummary; } });
