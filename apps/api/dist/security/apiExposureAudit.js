"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiExposureAudit = apiExposureAudit;
function apiExposureAudit() {
    const publicSurface = [
        '/health',
        '/health/live',
        '/health/ready',
        '/auth/*',
    ];
    const protectedSurface = [
        '/admin/*',
        '/notifications/*',
        '/investor/*',
        '/workspace/*',
        '/organizations/*',
    ];
    return {
        securityAuditSummary: {
            publicSurface,
            protectedSurface,
            note: 'Protected routes are expected to be enforced by auth/admin middleware.',
        },
    };
}
