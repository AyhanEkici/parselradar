"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestMunicipalitySignals = ingestMunicipalitySignals;
const ingestionSources_1 = require("../../config/ingestion/ingestionSources");
const municipalityMappings_1 = require("../../config/ingestion/municipalityMappings");
function ingestMunicipalitySignals(input) {
    const city = (input.city || '').toLowerCase();
    const district = (input.district || '').toLowerCase();
    const mappedDistricts = (municipalityMappings_1.MUNICIPALITY_MAPPINGS[city] || []);
    const matched = mappedDistricts.includes(district);
    return {
        source: ingestionSources_1.INGESTION_SOURCES.municipalitySignals.key,
        sourceConfidence: ingestionSources_1.INGESTION_SOURCES.municipalitySignals.confidence,
        matched,
        signals: matched ? ['municipality_mapping_verified'] : ['municipality_mapping_unavailable'],
    };
}
