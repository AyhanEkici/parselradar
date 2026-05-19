"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONNECTOR_ACTIVATION_POLICIES = void 0;
exports.CONNECTOR_ACTIVATION_POLICIES = {
    allowLiveExternalCalls: process.env.CONNECTOR_TEST_MODE === 'active',
    requireLegalApproval: true,
    requireEndpointAndCredentials: true,
    auditRetentionDays: Number(process.env.CONNECTOR_AUDIT_RETENTION_DAYS || 90),
};
