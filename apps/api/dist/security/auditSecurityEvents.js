"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditSecurityEvents = auditSecurityEvents;
exports.getSecurityAuditEvents = getSecurityAuditEvents;
const securityAuditLog = [];
function auditSecurityEvents(source, signals) {
    const now = new Date().toISOString();
    signals.forEach((signal) => {
        securityAuditLog.unshift({ at: now, source, signal });
    });
    if (securityAuditLog.length > 200) {
        securityAuditLog.length = 200;
    }
    return securityAuditLog.slice(0, 50);
}
function getSecurityAuditEvents() {
    return securityAuditLog.slice(0, 50);
}
