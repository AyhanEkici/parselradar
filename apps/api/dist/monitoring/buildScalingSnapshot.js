"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildScalingSnapshot = buildScalingSnapshot;
const autoscalingPolicies_1 = require("../config/runtime/autoscalingPolicies");
function buildScalingSnapshot() {
    const scaling = (0, autoscalingPolicies_1.resolveAutoscalingPolicy)();
    return {
        scalingStatus: scaling.scalingStatus,
        scalingPolicy: scaling.policy,
    };
}
