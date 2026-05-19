"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTracingSnapshot = buildTracingSnapshot;
const tracingPolicies_1 = require("../config/observability/tracingPolicies");
function buildTracingSnapshot() {
    const tracing = (0, tracingPolicies_1.resolveTracingPolicy)();
    return {
        tracingState: tracing.tracingState,
        tracing,
    };
}
