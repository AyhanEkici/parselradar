"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectStrategicLocation = detectStrategicLocation;
const infrastructureNodes_1 = require("../../config/geo/infrastructureNodes");
function detectStrategicLocation(input) {
    const signals = [];
    const normalizedCity = (input.city || '').trim().toLowerCase();
    const normalizedZoning = (input.zoningStatus || '').trim().toLowerCase();
    const nodes = infrastructureNodes_1.INFRASTRUCTURE_NODES.filter((node) => node.city === normalizedCity);
    const hasAirportNearby = nodes.some((node) => node.type === 'airport');
    if (hasAirportNearby) {
        signals.push('airport_proximity');
    }
    const hasOsbNearby = nodes.some((node) => node.type === 'osb');
    if (hasOsbNearby && normalizedZoning.includes('sanayi')) {
        signals.push('osb_cluster_opportunity');
    }
    const hasLogisticsHub = nodes.some((node) => node.type === 'logistics_hub');
    if (hasLogisticsHub && (normalizedZoning.includes('sanayi') || normalizedZoning.includes('industrial'))) {
        signals.push('logistics_hub_proximity');
    }
    const hasTourismZone = nodes.some((node) => node.type === 'tourism_zone');
    if (hasTourismZone && (normalizedZoning.includes('ticari') || normalizedZoning.includes('commercial'))) {
        signals.push('tourism_opportunity');
    }
    if (typeof input.areaM2 === 'number' && input.areaM2 >= 5000 && hasOsbNearby) {
        signals.push('developer_expansion_zone');
    }
    return Array.from(new Set(signals));
}
