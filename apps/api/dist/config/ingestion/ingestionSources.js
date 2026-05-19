"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INGESTION_SOURCES = void 0;
exports.INGESTION_SOURCES = {
    comparableListings: {
        key: 'comparable_listings',
        confidence: 'medium',
        refreshWindowHours: 24,
    },
    municipalitySignals: {
        key: 'municipality_signals',
        confidence: 'verified',
        refreshWindowHours: 72,
    },
    infrastructureSignals: {
        key: 'infrastructure_signals',
        confidence: 'verified',
        refreshWindowHours: 168,
    },
};
