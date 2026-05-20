# Security Proof Bundle

Generated at: 2026-05-20T00:01:47.725Z
Overall status: SKIPPED

## Checks

| Status | Check | Message | Detail |
| --- | --- | --- | --- |
| PASS | Upload governance engine exists | Required V31 module is present. | apps/api/src/security/uploadGovernanceEngine.ts |
| PASS | Export governance engine exists | Required V31 module is present. | apps/api/src/security/exportGovernanceEngine.ts |
| PASS | Token integrity validator exists | Required V31 module is present. | apps/api/src/session/tokenIntegrityValidator.ts |
| PASS | Brute force defense exists | Required V31 module is present. | apps/api/src/abuse/bruteForceDefense.ts |
| PASS | Security operations engine exists | Required V31 module is present. | apps/api/src/monitoring/securityOperationsEngine.ts |
| PASS | Governance compliance monitor exists | Required V31 module is present. | apps/api/src/governance/governanceComplianceMonitor.ts |
| PASS | Security audit card exists | Required V31 module is present. | apps/web/src/components/security/SecurityAuditCard.tsx |
| PASS | Upload governance card exists | Required V31 module is present. | apps/web/src/components/security/UploadGovernanceCard.tsx |
| PASS | Session diagnostics route mounted | Session diagnostics endpoint is present on auth routes. | apps/api/src/routes/authRoutes.ts |
| SKIPPED | Auth flow pilot@ | Missing SECURITY_VERIFY_PILOT_EMAIL or SECURITY_VERIFY_PILOT_PASSWORD |  |
| SKIPPED | Auth flow AyhanEkici@ | Missing SECURITY_VERIFY_AYHAN_EMAIL or SECURITY_VERIFY_AYHAN_PASSWORD |  |
| SKIPPED | Auth flow Mahir | Missing SECURITY_VERIFY_MAHIR_EMAIL or SECURITY_VERIFY_MAHIR_PASSWORD |  |

## Auth Reliability

| User | Login | Me | Detail |
| --- | --- | --- | --- |
| pilot@ | SKIPPED | SKIPPED | Missing SECURITY_VERIFY_PILOT_EMAIL or SECURITY_VERIFY_PILOT_PASSWORD |
| AyhanEkici@ | SKIPPED | SKIPPED | Missing SECURITY_VERIFY_AYHAN_EMAIL or SECURITY_VERIFY_AYHAN_PASSWORD |
| Mahir | SKIPPED | SKIPPED | Missing SECURITY_VERIFY_MAHIR_EMAIL or SECURITY_VERIFY_MAHIR_PASSWORD |

