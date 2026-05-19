"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemHealth = systemHealth;
function systemHealth(input) {
    const hasHighSecurity = input.securitySignals.some((s) => s.level === 'high');
    if (input.runtimeState === 'FAILED' || input.queueFailed > 0 || input.workerFailed > 0 || hasHighSecurity) {
        return {
            overall: 'FAILED',
            detail: 'System has failed components or high-severity security signals.',
        };
    }
    if (input.runtimeState === 'DEGRADED' || input.securitySignals.length > 0) {
        return {
            overall: 'DEGRADED',
            detail: 'System is operational with degraded runtime or non-critical security signals.',
        };
    }
    if (input.runtimeState === 'NOT_CONFIGURED' || input.runtimeState === 'DISABLED') {
        return {
            overall: input.runtimeState,
            detail: 'System runtime infrastructure is not configured or disabled.',
        };
    }
    return {
        overall: input.runtimeState === 'RUNNING' ? 'RUNNING' : 'READY',
        detail: 'System runtime is healthy and ready.',
    };
}
