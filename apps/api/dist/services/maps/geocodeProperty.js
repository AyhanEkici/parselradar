"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocodeProperty = geocodeProperty;
const municipalityCenters_1 = require("../../config/maps/municipalityCenters");
const normalizeCoordinateData_1 = require("./normalizeCoordinateData");
function normalize(value) {
    return (value || '').trim().toLowerCase();
}
function geocodeProperty(input) {
    const exact = (0, normalizeCoordinateData_1.normalizeCoordinateData)({
        latitude: input.latitude,
        longitude: input.longitude,
        source: input.coordinateSource || 'exact',
        confidence: input.geocodeConfidence,
    });
    if (exact) {
        return {
            coordinates: exact,
            geoConfidence: { level: exact.source, score: exact.confidence },
            fallbackUsed: exact.source !== 'exact',
        };
    }
    const city = normalize(input.city);
    const district = normalize(input.district);
    const center = municipalityCenters_1.MUNICIPALITY_CENTERS.find((item) => normalize(item.city) === city && normalize(item.district) === district)
        || municipalityCenters_1.MUNICIPALITY_CENTERS.find((item) => normalize(item.city) === city && !item.district);
    if (!center) {
        return {
            coordinates: null,
            geoConfidence: { level: 'unresolved', score: 0 },
            fallbackUsed: true,
        };
    }
    const fallback = (0, normalizeCoordinateData_1.normalizeCoordinateData)({
        latitude: center.latitude,
        longitude: center.longitude,
        source: 'district_center_fallback',
        confidence: center.confidence,
    });
    return {
        coordinates: fallback,
        geoConfidence: {
            level: fallback?.source || 'district_center_fallback',
            score: fallback?.confidence || center.confidence,
        },
        fallbackUsed: true,
    };
}
