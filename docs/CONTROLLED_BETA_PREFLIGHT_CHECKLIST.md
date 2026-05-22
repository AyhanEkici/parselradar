# CONTROLLED BETA PREFLIGHT CHECKLIST

## Release State
- user-flow status: CONTROLLED_BETA_CANDIDATE
- admin test account: REQUIRED
- email provider readiness: CONFIG_REQUIRED
- SPF/DKIM/DMARC: REQUIRED BEFORE PUBLIC LAUNCH
- database backup restore: PASS
- document/file restore: PASS
- public launch: NOT_READY

## Beta Access Policy
- Beta is allowed only with known testers and active admin supervision.
- Do not open public sign-up for uncontrolled usage.
- Keep admin operations restricted to trusted operators.

## Exact Prefight Checklist
1. Confirm working tree is clean and target release commit is pinned.
2. Confirm deployed admin test account exists and admin login succeeds.
3. Confirm admin-only routes remain blocked for non-admin users.
4. Confirm SMTP provider configuration remains `CONFIG_REQUIRED` unless operator has completed secure setup.
5. Confirm SPF/DKIM/DMARC evidence is collected outside git before any public launch decision.
6. Run operational verifiers:
   - `npm run verify:email-provider-readiness`
   - `npm run verify:database-backup-readiness`
   - `npm run verify:document-backup-readiness`
   - `npm run audit:production-readiness`
7. Confirm backup restore/document restore status remains PASS.
8. Confirm no real secrets are present in repository diffs.
9. Confirm controlled beta tester list and support/escalation owner are assigned.
10. Record go/no-go decision with timestamp and operator name.

## Launch Gate Rule
- Controlled beta can proceed only when admin supervision is active.
- Public launch remains blocked while email provider or DNS authentication gates are `CONFIG_REQUIRED`.
