"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clusterComparableParcels = clusterComparableParcels;
const geocodeProperty_1 = require("../maps/geocodeProperty");
const calculateDistanceToInfrastructure_1 = require("../coordinates/calculateDistanceToInfrastructure");
function clusterComparableParcels(input) {
    const subjectGeocode = (0, geocodeProperty_1.geocodeProperty)(input.subject);
    if (!subjectGeocode.coordinates) {
        return { closeCount: 0, midCount: 0, broadCount: 0, clusterStrength: 0, plottedComparables: [] };
    }
    const subjectCoordinates = subjectGeocode.coordinates;
    const plottedComparables = input.comparables
        .map((comparable) => {
        const geocoded = (0, geocodeProperty_1.geocodeProperty)({
            city: comparable.il,
            district: comparable.ilce,
            latitude: comparable.latitude,
            longitude: comparable.longitude,
            coordinateSource: comparable.coordinateSource,
            geocodeConfidence: comparable.geocodeConfidence,
        });
        const comparableCoordinates = geocoded.coordinates;
        if (!comparableCoordinates)
            return null;
        return {
            _id: comparable._id,
            latitude: comparableCoordinates.latitude,
            longitude: comparableCoordinates.longitude,
            distanceKm: (0, calculateDistanceToInfrastructure_1.calculateDistanceToInfrastructure)(subjectCoordinates, comparableCoordinates),
            pricePerM2: comparable.pricePerM2,
        };
    })
        .filter((item) => Boolean(item))
        .sort((left, right) => left.distanceKm - right.distanceKm)
        .slice(0, 24);
    const closeCount = plottedComparables.filter((item) => item.distanceKm <= 3).length;
    const midCount = plottedComparables.filter((item) => item.distanceKm > 3 && item.distanceKm <= 10).length;
    const broadCount = plottedComparables.filter((item) => item.distanceKm > 10 && item.distanceKm <= 25).length;
    const clusterStrength = Math.max(0, Math.min(100, Math.round(closeCount * 14 + midCount * 7 + broadCount * 3)));
    return {
        closeCount,
        midCount,
        broadCount,
        clusterStrength,
        plottedComparables,
    };
}
