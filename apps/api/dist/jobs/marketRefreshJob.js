"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketRefreshJob = marketRefreshJob;
const marketQueue_1 = require("../queues/marketQueue");
function marketRefreshJob(input) {
    return (0, marketQueue_1.enqueueMarket)({
        propertyId: input.propertyId,
        districtKey: input.districtKey || null,
        type: 'market_refresh_job',
        queuedAt: new Date().toISOString(),
    });
}
