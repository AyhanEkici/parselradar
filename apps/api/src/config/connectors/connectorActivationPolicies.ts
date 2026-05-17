export const CONNECTOR_ACTIVATION_POLICIES = {
  allowLiveExternalCalls: process.env.CONNECTOR_TEST_MODE === 'active',
  requireLegalApproval: true,
  requireEndpointAndCredentials: true,
  auditRetentionDays: Number(process.env.CONNECTOR_AUDIT_RETENTION_DAYS || 90),
};
