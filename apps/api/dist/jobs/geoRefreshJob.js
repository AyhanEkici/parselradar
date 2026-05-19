"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geoRefreshJob = geoRefreshJob;
const geoQueue_1 = require("../queues/geoQueue");
function geoRefreshJob(input) {
    return (0, geoQueue_1.enqueueGeo)({
        propertyId: input.propertyId,
        city: input.city || null,
        district: input.district || null,
        type: 'geo_refresh_job',
        queuedAt: new Date().toISOString(),
    });
}
