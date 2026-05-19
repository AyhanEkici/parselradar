"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRiskFlags = calculateRiskFlags;
function normalize(value) {
    return (value || '').trim().toLowerCase();
}
function hasNo(value) {
    const v = normalize(value);
    return v.includes('no') || v.includes('none') || v.includes('yok');
}
function calculateRiskFlags(input) {
    const riskFlags = [];
    const missingInputs = [];
    if (!input.askingPriceTRY || input.askingPriceTRY <= 0) {
        missingInputs.push('askingPriceTRY');
        riskFlags.push('HIGH: Asking price is missing');
    }
    if (!input.areaM2 || input.areaM2 <= 0) {
        missingInputs.push('areaM2');
        riskFlags.push('HIGH: Parcel area is missing');
    }
    if (!input.pricePerM2 || input.pricePerM2 <= 0) {
        missingInputs.push('pricePerM2');
        riskFlags.push('MEDIUM: Unit price is not explicit');
    }
    const zoning = normalize(input.zoningStatus);
    if (!zoning || zoning === 'unknown') {
        missingInputs.push('zoningStatus');
        riskFlags.push('HIGH: Zoning status is missing');
    }
    else if (zoning.includes('agricultural') || zoning.includes('tarim')) {
        riskFlags.push('MEDIUM: Agricultural zoning can reduce development options');
    }
    else if (zoning.includes('protected') || zoning.includes('sit') || zoning.includes('park')) {
        riskFlags.push('HIGH: Protected/park zoning may block development');
    }
    if (!input.tapuType || normalize(input.tapuType) === 'unknown') {
        missingInputs.push('tapuType');
        riskFlags.push('HIGH: Title deed type is missing');
    }
    if (!input.ada) {
        missingInputs.push('ada');
        riskFlags.push('MEDIUM: Cadastral block (ada) missing');
    }
    if (!input.parsel) {
        missingInputs.push('parsel');
        riskFlags.push('MEDIUM: Parcel number missing');
    }
    if (hasNo(input.roadAccess)) {
        riskFlags.push('HIGH: No direct road access');
    }
    if (hasNo(input.electricity)) {
        riskFlags.push('MEDIUM: Electricity connection unavailable');
    }
    if (hasNo(input.water)) {
        riskFlags.push('MEDIUM: Water connection unavailable');
    }
    if (input.docCount === 0) {
        riskFlags.push('HIGH: No supporting documents uploaded');
    }
    else if (input.docCount < 3) {
        riskFlags.push('MEDIUM: Limited supporting document set');
    }
    if (!input.hasTitleDoc) {
        riskFlags.push('HIGH: Title-related document missing');
    }
    if (!input.hasZoningDoc) {
        riskFlags.push('MEDIUM: Zoning evidence document missing');
    }
    if (!input.hasOwnershipDoc) {
        riskFlags.push('MEDIUM: Ownership evidence document missing');
    }
    const highCount = riskFlags.filter((f) => f.startsWith('HIGH:')).length;
    const mediumCount = riskFlags.filter((f) => f.startsWith('MEDIUM:')).length;
    const riskClassification = highCount >= 3 || highCount + mediumCount >= 7
        ? 'HIGH'
        : highCount >= 1 || mediumCount >= 4
            ? 'MEDIUM'
            : 'LOW';
    return { riskFlags, missingInputs, riskClassification };
}
