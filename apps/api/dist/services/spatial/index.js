"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSpatialIntelligence = buildSpatialIntelligence;
const geocodeProperty_1 = require("../maps/geocodeProperty");
const buildMapSummary_1 = require("../maps/buildMapSummary");
const detectNearbyInfrastructure_1 = require("../coordinates/detectNearbyInfrastructure");
const calculateRegionalCluster_1 = require("../coordinates/calculateRegionalCluster");
const clusterComparableParcels_1 = require("./clusterComparableParcels");
const detectSpatialOpportunity_1 = require("./detectSpatialOpportunity");
const calculateSpatialLiquidity_1 = require("./calculateSpatialLiquidity");
const buildSpatialSignals_1 = require("./buildSpatialSignals");
function buildSpatialIntelligence(input) {
    const geocode = (0, geocodeProperty_1.geocodeProperty)({
        city: input.city,
        district: input.district,
        latitude: input.latitude,
        longitude: input.longitude,
        coordinateSource: input.coordinateSource,
        geocodeConfidence: input.geocodeConfidence,
    });
    if (!geocode.coordinates) {
        return {
            coordinates: null,
            nearbyInfrastructure: [],
            infrastructureDistances: {},
            spatialSignals: ['unresolved_coordinates'],
            spatialLiquidity: { score: 0, label: 'thin' },
            clusterStrength: 0,
            geoConfidence: geocode.geoConfidence,
            mapSummary: 'No resolved coordinates available for map intelligence.',
            comparableMapPoints: [],
            regionalCluster: { clusterLabel: 'unresolved_cluster' },
        };
    }
    const infrastructure = (0, detectNearbyInfrastructure_1.detectNearbyInfrastructure)(geocode.coordinates, input.city);
    const regionalCluster = (0, calculateRegionalCluster_1.calculateRegionalCluster)(geocode.coordinates, input.city, input.district);
    const comparableClusters = (0, clusterComparableParcels_1.clusterComparableParcels)({
        subject: {
            city: input.city,
            district: input.district,
            latitude: geocode.coordinates.latitude,
            longitude: geocode.coordinates.longitude,
            coordinateSource: geocode.coordinates.source,
            geocodeConfidence: geocode.coordinates.confidence,
        },
        comparables: input.comparables,
    });
    const spatialLiquidity = (0, calculateSpatialLiquidity_1.calculateSpatialLiquidity)({
        clusterStrength: comparableClusters.clusterStrength,
        comparableCount: comparableClusters.plottedComparables.length,
        roadDistanceKm: regionalCluster.roadCluster?.distanceKm,
        municipalityDistanceKm: regionalCluster.municipality?.distanceKm,
    });
    const opportunity = (0, detectSpatialOpportunity_1.detectSpatialOpportunity)({
        infrastructureDistances: infrastructure.infrastructureDistances,
        clusterStrength: comparableClusters.clusterStrength,
        zoningStatus: input.zoningStatus,
    });
    const spatialSignals = (0, buildSpatialSignals_1.buildSpatialSignals)({
        nearbyInfrastructure: infrastructure.nearbyInfrastructure,
        opportunitySignals: opportunity.signals,
        spatialLiquidity,
        clusterStrength: comparableClusters.clusterStrength,
        geoConfidence: geocode.geoConfidence,
    });
    const mapSummary = (0, buildMapSummary_1.buildMapSummary)({
        geoConfidence: geocode.geoConfidence,
        nearbyInfrastructure: infrastructure.nearbyInfrastructure,
        clusterStrength: comparableClusters.clusterStrength,
        spatialLiquidity,
        spatialSignals,
    });
    return {
        coordinates: {
            latitude: geocode.coordinates.latitude,
            longitude: geocode.coordinates.longitude,
            source: geocode.coordinates.source,
        },
        nearbyInfrastructure: infrastructure.nearbyInfrastructure,
        infrastructureDistances: infrastructure.infrastructureDistances,
        spatialSignals,
        spatialLiquidity,
        clusterStrength: comparableClusters.clusterStrength,
        geoConfidence: geocode.geoConfidence,
        mapSummary,
        comparableMapPoints: comparableClusters.plottedComparables,
        regionalCluster,
    };
}
