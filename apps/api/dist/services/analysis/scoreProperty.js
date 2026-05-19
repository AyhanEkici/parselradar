"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreProperty = scoreProperty;
const calculateDeveloperFit_1 = require("./calculateDeveloperFit");
const calculateMarketPosition_1 = require("./calculateMarketPosition");
const calculateRiskFlags_1 = require("./calculateRiskFlags");
const generateAnalysisExplanation_1 = require("./generateAnalysisExplanation");
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function documentQualityScore(documents) {
    const validDocs = documents.filter((d) => !d.fileMissing);
    const docCount = validDocs.length;
    const uniqueTypes = new Set(validDocs.map((d) => d.documentType).filter(Boolean)).size;
    const totalSizeMb = validDocs.reduce((sum, d) => sum + (typeof d.sizeBytes === 'number' ? d.sizeBytes : 0), 0) / (1024 * 1024);
    const score = clamp(Math.round(docCount * 8 + uniqueTypes * 6 + Math.min(16, totalSizeMb * 1.5)), 0, 100);
    const hasTitleDoc = validDocs.some((d) => {
        const t = (d.documentType || '').toUpperCase();
        return t.includes('TAPU') || t.includes('KAYIT');
    });
    const hasZoningDoc = validDocs.some((d) => {
        const t = (d.documentType || '').toUpperCase();
        return t.includes('IMAR') || t.includes('PLAN');
    });
    const hasOwnershipDoc = validDocs.some((d) => {
        const t = (d.documentType || '').toUpperCase();
        return t.includes('TAKYIDAT') || t.includes('TAPU');
    });
    return {
        score,
        docCount,
        uniqueTypes,
        hasTitleDoc,
        hasZoningDoc,
        hasOwnershipDoc,
    };
}
function inputCompletenessScore(property) {
    const required = [
        'il',
        'ilce',
        'askingPriceTRY',
        'areaM2',
        'pricePerM2',
        'zoningStatus',
        'tapuType',
        'ada',
        'parsel',
        'roadAccess',
        'electricity',
        'water',
    ];
    const present = required.filter((field) => {
        const value = property[field];
        if (typeof value === 'number')
            return value > 0;
        return Boolean(value);
    }).length;
    return Math.round((present / required.length) * 100);
}
function scoreProperty(input) {
    const docQuality = documentQualityScore(input.documents || []);
    const market = (0, calculateMarketPosition_1.calculateMarketPosition)({
        il: input.property.il,
        ilce: input.property.ilce,
        areaM2: input.property.areaM2,
        askingPriceTRY: input.property.askingPriceTRY,
        pricePerM2: input.property.pricePerM2,
        docCount: docQuality.docCount,
    });
    const developer = (0, calculateDeveloperFit_1.calculateDeveloperFit)({
        areaM2: input.property.areaM2,
        zoningStatus: input.property.zoningStatus,
        tapuType: input.property.tapuType,
        ada: input.property.ada,
        parsel: input.property.parsel,
        pafta: input.property.pafta,
        roadAccess: input.property.roadAccess,
        electricity: input.property.electricity,
        water: input.property.water,
    });
    const risks = (0, calculateRiskFlags_1.calculateRiskFlags)({
        askingPriceTRY: input.property.askingPriceTRY,
        areaM2: input.property.areaM2,
        pricePerM2: input.property.pricePerM2,
        zoningStatus: input.property.zoningStatus,
        tapuType: input.property.tapuType,
        ada: input.property.ada,
        parsel: input.property.parsel,
        roadAccess: input.property.roadAccess,
        electricity: input.property.electricity,
        water: input.property.water,
        docCount: docQuality.docCount,
        hasTitleDoc: docQuality.hasTitleDoc,
        hasZoningDoc: docQuality.hasZoningDoc,
        hasOwnershipDoc: docQuality.hasOwnershipDoc,
    });
    const completeness = inputCompletenessScore(input.property);
    let marketScore = 70;
    if (market.marketPosition === 'DEEP_DISCOUNT')
        marketScore = 88;
    if (market.marketPosition === 'DISCOUNT')
        marketScore = 82;
    if (market.marketPosition === 'FAIR')
        marketScore = 76;
    if (market.marketPosition === 'PREMIUM')
        marketScore = 60;
    if (market.marketPosition === 'STRETCHED')
        marketScore = 42;
    const zoningConfidence = developer.zoningPotentialScore;
    const liquidityScore = market.liquiditySignal === 'HIGH' ? 85 : market.liquiditySignal === 'MEDIUM' ? 62 : 38;
    const weightSet = input.productType === 'PARSEL_INSIGHT'
        ? { market: 0.18, developer: 0.2, zoning: 0.26, completeness: 0.18, docs: 0.1, liquidity: 0.08 }
        : input.productType === 'DEVELOPER_FIT'
            ? { market: 0.12, developer: 0.34, zoning: 0.24, completeness: 0.14, docs: 0.08, liquidity: 0.08 }
            : { market: 0.26, developer: 0.24, zoning: 0.18, completeness: 0.14, docs: 0.1, liquidity: 0.08 };
    const baseScore = marketScore * weightSet.market +
        developer.developerFitScore * weightSet.developer +
        zoningConfidence * weightSet.zoning +
        completeness * weightSet.completeness +
        docQuality.score * weightSet.docs +
        liquidityScore * weightSet.liquidity;
    const highRiskPenalty = risks.riskFlags.filter((r) => r.startsWith('HIGH:')).length * 4;
    const mediumRiskPenalty = risks.riskFlags.filter((r) => r.startsWith('MEDIUM:')).length * 1.5;
    const score = clamp(Math.round(baseScore - highRiskPenalty - mediumRiskPenalty), 0, 100);
    const confidenceRaw = completeness * 0.42 +
        docQuality.score * 0.28 +
        market.pricingConfidence * 0.2 +
        (100 - risks.missingInputs.length * 6) * 0.1;
    const confidence = clamp(Math.round(confidenceRaw), 25, 98);
    const explanation = (0, generateAnalysisExplanation_1.generateAnalysisExplanation)({
        score,
        confidence,
        marketPosition: market.marketPosition,
        developerFit: developer.developerFit,
        zoningPotential: developer.zoningPotential,
        liquiditySignal: market.liquiditySignal,
        riskClassification: risks.riskClassification,
        riskFlags: risks.riskFlags,
        missingInputs: risks.missingInputs,
        comparablePricePerM2: market.comparablePricePerM2,
        subjectPricePerM2: market.subjectPricePerM2,
        priceDeviationRatio: market.priceDeviationRatio,
    });
    const factorsUsed = {
        productType: input.productType || 'QUICK_SCORE',
        inputCompleteness: completeness,
        documentQuality: docQuality.score,
        documentCount: docQuality.docCount,
        uniqueDocumentTypes: docQuality.uniqueTypes,
        comparablePricePerM2: market.comparablePricePerM2,
        subjectPricePerM2: market.subjectPricePerM2,
        priceDeviationRatio: market.priceDeviationRatio,
        developerFitScore: developer.developerFitScore,
        zoningPotentialScore: developer.zoningPotentialScore,
        parcelReadinessScore: developer.parcelReadinessScore,
        riskClassification: risks.riskClassification,
        calibrationConfigVersion: 'analysis-v2-config-tables',
    };
    return {
        score,
        confidence,
        strengths: explanation.strengths,
        risks: explanation.risks,
        recommendations: explanation.recommendations,
        valuationBand: market.valuationBand,
        marketPosition: market.marketPosition,
        developerFit: developer.developerFit,
        zoningPotential: developer.zoningPotential,
        liquiditySignal: market.liquiditySignal,
        riskFlags: risks.riskFlags,
        missingInputs: risks.missingInputs,
        riskClassification: risks.riskClassification,
        factorsUsed,
        signal: explanation.signal,
        summary: explanation.summary,
    };
}
