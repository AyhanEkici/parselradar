"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTelemetryEvent = buildTelemetryEvent;
const traceContext_1 = require("./traceContext");
function buildTelemetryEvent(input) {
    return {
        name: input.name,
        level: input.level || 'info',
        trace: (0, traceContext_1.buildTraceContext)({
            requestId: input.requestId,
            route: input.route,
            actorUserId: input.actorUserId,
        }),
        metadata: input.metadata || {},
        createdAt: new Date().toISOString(),
    };
}
