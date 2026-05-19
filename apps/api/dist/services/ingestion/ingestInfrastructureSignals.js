"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestInfrastructureSignals = ingestInfrastructureSignals;
const ingestionSources_1 = require("../../config/ingestion/ingestionSources");
const airportNodes_1 = require("../../config/maps/airportNodes");
const industrialZones_1 = require("../../config/maps/industrialZones");
const roadCorridors_1 = require("../../config/maps/roadCorridors");
const tourismZones_1 = require("../../config/maps/tourismZones");
function ingestInfrastructureSignals(input) {
    const city = (input.city || '').toLowerCase();
    const airportCount = airportNodes_1.AIRPORT_NODES.filter((item) => item.city === city).length;
    const industrialCount = industrialZones_1.INDUSTRIAL_ZONES.filter((item) => item.city === city).length;
    const corridorCount = roadCorridors_1.ROAD_CORRIDORS.filter((item) => item.city === city).length;
    const tourismCount = tourismZones_1.TOURISM_ZONES.filter((item) => item.city === city).length;
    return {
        source: ingestionSources_1.INGESTION_SOURCES.infrastructureSignals.key,
        sourceConfidence: ingestionSources_1.INGESTION_SOURCES.infrastructureSignals.confidence,
        airportCount,
        industrialCount,
        corridorCount,
        tourismCount,
        signals: [
            airportCount > 0 ? 'airport_dataset_available' : 'airport_dataset_sparse',
            industrialCount > 0 ? 'industrial_dataset_available' : 'industrial_dataset_sparse',
            corridorCount > 0 ? 'road_dataset_available' : 'road_dataset_sparse',
            tourismCount > 0 ? 'tourism_dataset_available' : 'tourism_dataset_sparse',
        ],
    };
}
