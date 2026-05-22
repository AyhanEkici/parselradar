# CONTROLLED BETA OPERATIONAL READINESS

## Status Summary
- user-flow status: CONTROLLED_BETA_CANDIDATE
- public launch status: NOT_READY
- email provider readiness: CONFIG_REQUIRED
- SPF/DKIM/DMARC status: CONFIG_REQUIRED
- database backup restore readiness: PASS
- document/file restore readiness: PASS
- admin deployed test account status: ADMIN_DEPLOYMENT_TEST_ACCOUNT_MISSING

## Evidence Sources
- `npm run verify:email-provider-readiness` -> `proof/p2-4b-email-provider-readiness.json` (`overallStatus: CONFIG_REQUIRED`)
- `npm run verify:database-backup-readiness` -> `proof/p2-4b-database-backup-readiness.json` (`overallStatus: PASS`)
- `npm run verify:document-backup-readiness` -> `proof/p2-4b-document-backup-readiness.json` (`overallStatus: PASS`)
- `npm run audit:production-readiness` -> `proof/production-readiness-audit.json`

## Launch Gate Interpretation
- Controlled beta can proceed with current product/user-flow state.
- Public launch remains blocked until email provider and DNS authentication gates are fully configured and proven.
- No SMTP credentials or DNS secrets are stored in this repository.

## Required Manual/Operator Actions
1. Select and approve production SMTP provider account and owner.
2. Configure deployment secret store values for SMTP and notification sender variables.
3. Complete DNS authentication setup and proof capture for SPF, DKIM, and DMARC.
4. Execute a production-like email dry-run and record bounce/complaint handling evidence.
5. Provision or restore deployed admin smoke-test account and confirm admin login path.
6. Re-run operational verifiers and `audit:production-readiness` after configuration changes.
7. Use the deployed admin test account runbook for controlled beta only and rotate/remove credentials after smoke completion.
8. Execute the controlled beta preflight checklist before inviting any tester.

## Operational Runbooks
- `docs/DEPLOYED_ADMIN_TEST_ACCOUNT_RUNBOOK.md`
- `docs/CONTROLLED_BETA_PREFLIGHT_CHECKLIST.md`

## Guardrails
- Do not claim production-ready while email provider readiness is `CONFIG_REQUIRED`.
- Do not claim SPF/DKIM/DMARC PASS without operator-provided DNS proof.
- Backup restore readiness PASS is documentation/verifier-based and must still be exercised via scheduled restore drills.
