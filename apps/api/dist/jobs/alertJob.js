"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertJob = alertJob;
const alertQueue_1 = require("../queues/alertQueue");
function alertJob(input) {
    return (0, alertQueue_1.enqueueAlert)({
        propertyId: input.propertyId,
        signalCount: input.signalCount || 0,
        type: 'alert_job',
        queuedAt: new Date().toISOString(),
    });
}
