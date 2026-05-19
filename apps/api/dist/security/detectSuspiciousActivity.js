"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectSuspiciousActivity = detectSuspiciousActivity;
const monitoringThresholds_1 = require("../config/runtime/monitoringThresholds");
const securityPolicies_1 = require("../config/runtime/securityPolicies");
function detectSuspiciousActivity(input) {
    const signals = [];
    if ((input.rapidRequestCount || 0) >= securityPolicies_1.SECURITY_POLICIES.maxRapidRequests) {
        signals.push({
            level: 'high',
            type: 'rapid_request_burst',
            message: 'Request burst exceeds security policy threshold.',
            fingerprint: input.fingerprint,
        });
    }
    if ((input.distinctRoutes || 0) >= securityPolicies_1.SECURITY_POLICIES.maxDistinctRoutesPerWindow) {
        signals.push({
            level: 'medium',
            type: 'route_spray_pattern',
            message: 'Distinct route activity exceeds expected operational window.',
            fingerprint: input.fingerprint,
        });
    }
    if ((input.authFailures || 0) >= monitoringThresholds_1.MONITORING_THRESHOLDS.securitySignalWarning) {
        const authFailures = input.authFailures || 0;
        signals.push({
            level: authFailures >= monitoringThresholds_1.MONITORING_THRESHOLDS.securitySignalCritical ? 'high' : 'medium',
            type: 'auth_failure_pattern',
            message: 'Authentication failures indicate possible brute-force behavior.',
            fingerprint: input.fingerprint,
        });
    }
    return signals;
}
