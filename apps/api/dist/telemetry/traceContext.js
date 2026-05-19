"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTraceContext = buildTraceContext;
function buildTraceContext(input) {
    return {
        traceId: input.requestId || `trace_${Date.now()}`,
        spanId: `span_${Math.random().toString(36).slice(2, 10)}`,
        route: input.route || '-',
        actorUserId: input.actorUserId || '-',
        generatedAt: new Date().toISOString(),
    };
}
