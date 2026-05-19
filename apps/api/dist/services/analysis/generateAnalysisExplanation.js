"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAnalysisExplanation = generateAnalysisExplanation;
function deviationPercent(ratio) {
    return `${Math.round(ratio * 100)}%`;
}
function generateAnalysisExplanation(input) {
    const strengths = [];
    const risks = [];
    const recommendations = [];
    if (input.marketPosition === 'DISCOUNT' || input.marketPosition === 'DEEP_DISCOUNT') {
        strengths.push(`Pricing is below comparable baseline (${deviationPercent(input.priceDeviationRatio)}).`);
    }
    if (input.marketPosition === 'FAIR') {
        strengths.push('Pricing is aligned with comparable baseline.');
    }
    if (input.marketPosition === 'PREMIUM') {
        risks.push(`Pricing is moderately above comparable baseline (${deviationPercent(input.priceDeviationRatio)}).`);
        recommendations.push('Validate premium justification with location and legal certainty evidence.');
    }
    if (input.marketPosition === 'STRETCHED') {
        risks.push(`Pricing is significantly above comparable baseline (${deviationPercent(input.priceDeviationRatio)}).`);
        recommendations.push('Revisit asking price or gather stronger market comparables.');
    }
    if (input.developerFit === 'HIGH')
        strengths.push('Parcel shows strong developer suitability.');
    if (input.developerFit === 'MEDIUM')
        recommendations.push('Improve parcel and infrastructure evidence for stronger developer fit.');
    if (input.developerFit === 'LOW') {
        risks.push('Developer suitability is weak with current data.');
        recommendations.push('Address parcel/zoning/infrastructure gaps before acquisition.');
    }
    if (input.zoningPotential === 'HIGH')
        strengths.push('Zoning potential appears favorable.');
    if (input.zoningPotential === 'LOW') {
        risks.push('Zoning potential appears limited.');
        recommendations.push('Confirm allowable use with municipality before proceeding.');
    }
    if (input.liquiditySignal === 'HIGH')
        strengths.push('Liquidity outlook is favorable.');
    if (input.liquiditySignal === 'LOW') {
        risks.push('Liquidity outlook is weak for near-term exit.');
        recommendations.push('Plan for longer holding period or adjusted pricing strategy.');
    }
    input.riskFlags.forEach((flag) => {
        if (!risks.includes(flag))
            risks.push(flag);
    });
    if (input.missingInputs.length) {
        recommendations.push(`Complete missing inputs: ${input.missingInputs.join(', ')}`);
    }
    recommendations.push(`Benchmark subject price (${input.subjectPricePerM2.toLocaleString('tr-TR')} TRY/m²) against comparable (${input.comparablePricePerM2.toLocaleString('tr-TR')} TRY/m²).`);
    const signal = input.score >= 78 && input.riskClassification === 'LOW'
        ? 'STRONG'
        : input.score >= 58 && input.riskClassification !== 'HIGH'
            ? 'MODERATE'
            : input.score >= 40
                ? 'WEAK'
                : 'NEEDS_REVIEW';
    const summary = `${signal} profile. Score ${input.score}/100 with confidence ${input.confidence}%. ` +
        `Market position: ${input.marketPosition}, developer fit: ${input.developerFit}, zoning potential: ${input.zoningPotential}, liquidity: ${input.liquiditySignal}.`;
    return {
        strengths,
        risks,
        recommendations: Array.from(new Set(recommendations)),
        summary,
        signal,
    };
}
