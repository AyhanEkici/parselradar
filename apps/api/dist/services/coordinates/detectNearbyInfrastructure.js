"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectNearbyInfrastructure = detectNearbyInfrastructure;
const airportNodes_1 = require("../../config/maps/airportNodes");
const industrialZones_1 = require("../../config/maps/industrialZones");
const infrastructureNodes_1 = require("../../config/maps/infrastructureNodes");
const roadCorridors_1 = require("../../config/maps/roadCorridors");
const tourismZones_1 = require("../../config/maps/tourismZones");
const calculateDistanceToInfrastructure_1 = require("./calculateDistanceToInfrastructure");
const ALL_NODES = [...airportNodes_1.AIRPORT_NODES, ...industrialZones_1.INDUSTRIAL_ZONES, ...infrastructureNodes_1.INFRASTRUCTURE_NODES, ...roadCorridors_1.ROAD_CORRIDORS, ...tourismZones_1.TOURISM_ZONES];
function detectNearbyInfrastructure(coordinates, city) {
    const normalizedCity = (city || '').trim().toLowerCase();
    const matches = ALL_NODES
        .filter((node) => !normalizedCity || node.city === normalizedCity)
        .map((node) => ({
        id: node.id,
        name: node.name,
        type: node.type,
        city: node.city,
        distanceKm: (0, calculateDistanceToInfrastructure_1.calculateDistanceToInfrastructure)(coordinates, {
            latitude: node.latitude,
            longitude: node.longitude,
        }),
        radiusKm: node.radiusKm,
    }))
        .sort((left, right) => left.distanceKm - right.distanceKm);
    const nearbyInfrastructure = matches.filter((item) => item.distanceKm <= item.radiusKm).map(({ radiusKm, ...item }) => item);
    const infrastructureDistances = {};
    for (const item of matches) {
        if (infrastructureDistances[item.type] === undefined) {
            infrastructureDistances[item.type] = item.distanceKm;
        }
    }
    return {
        nearbyInfrastructure,
        infrastructureDistances,
        nearestNodes: matches.slice(0, 8).map(({ radiusKm, ...item }) => item),
    };
}
