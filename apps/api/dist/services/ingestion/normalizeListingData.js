"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeListingData = normalizeListingData;
function toNumber(value) {
    return typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : undefined;
}
function normalizeListingData(input) {
    const areaM2 = toNumber(input.listing.areaM2 ?? input.listing.area);
    const askingPriceTRY = toNumber(input.listing.askingPriceTRY ?? input.listing.priceTRY ?? input.listing.price);
    const pricePerM2 = toNumber(input.listing.pricePerM2) ?? (areaM2 && askingPriceTRY ? Math.round(askingPriceTRY / areaM2) : undefined);
    return {
        externalId: String(input.listing.externalId || input.listing.id || `${input.source}-${input.listing.il || input.listing.city || 'unknown'}-${input.listing.ilce || input.listing.district || 'unknown'}-${areaM2 || 0}`),
        city: String(input.listing.il || input.listing.city || '').toLowerCase() || undefined,
        district: String(input.listing.ilce || input.listing.district || '').toLowerCase() || undefined,
        areaM2,
        pricePerM2,
        askingPriceTRY,
        latitude: toNumber(input.listing.latitude),
        longitude: toNumber(input.listing.longitude),
        source: input.source,
    };
}
