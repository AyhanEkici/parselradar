"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistanceToInfrastructure = calculateDistanceToInfrastructure;
function calculateDistanceToInfrastructure(from, to) {
    const earthRadiusKm = 6371;
    const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
    const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;
    const startLat = (from.latitude * Math.PI) / 180;
    const endLat = (to.latitude * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(startLat) * Math.cos(endLat);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((earthRadiusKm * c).toFixed(2));
}
