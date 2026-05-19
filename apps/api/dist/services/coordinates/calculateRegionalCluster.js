"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRegionalCluster = calculateRegionalCluster;
const municipalityCenters_1 = require("../../config/maps/municipalityCenters");
const roadCorridors_1 = require("../../config/maps/roadCorridors");
const calculateDistanceToInfrastructure_1 = require("./calculateDistanceToInfrastructure");
function normalize(value) {
    return (value || '').trim().toLowerCase();
}
function calculateRegionalCluster(coordinates, city, district) {
    const normalizedCity = normalize(city);
    const normalizedDistrict = normalize(district);
    const nearestMunicipality = municipalityCenters_1.MUNICIPALITY_CENTERS
        .filter((item) => !normalizedCity || normalize(item.city) === normalizedCity)
        .map((item) => ({
        ...item,
        distanceKm: (0, calculateDistanceToInfrastructure_1.calculateDistanceToInfrastructure)(coordinates, item),
    }))
        .sort((left, right) => left.distanceKm - right.distanceKm)[0];
    const nearestRoad = roadCorridors_1.ROAD_CORRIDORS
        .filter((item) => !normalizedCity || normalize(item.city) === normalizedCity)
        .map((item) => ({
        ...item,
        distanceKm: (0, calculateDistanceToInfrastructure_1.calculateDistanceToInfrastructure)(coordinates, item),
    }))
        .sort((left, right) => left.distanceKm - right.distanceKm)[0];
    const clusterLabel = normalizedDistrict
        ? `${normalizedDistrict}_cluster`
        : nearestMunicipality?.city
            ? `${nearestMunicipality.city}_cluster`
            : 'regional_cluster';
    return {
        municipality: nearestMunicipality
            ? {
                city: nearestMunicipality.city,
                district: nearestMunicipality.district,
                distanceKm: nearestMunicipality.distanceKm,
            }
            : undefined,
        roadCluster: nearestRoad
            ? {
                name: nearestRoad.name,
                distanceKm: nearestRoad.distanceKm,
            }
            : undefined,
        clusterLabel,
    };
}
