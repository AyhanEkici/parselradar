# Login Proof Bundle

Generated at: 2026-05-20T00:23:53.833Z
Overall status: FAIL

## Root Cause Found

- Root cause found: mixed-case legacy email records could fail deterministic lookup when login input is normalized to lowercase.
- Token payload and middleware compatibility were hardened to keep id/email/role consistent and backward-compatible.

## Proof Checks

| Check | Status | Detail |
| --- | --- | --- |
| login route proof | FAIL | Verification halted before route verification. |
| token shape proof | FAIL | Verification halted before token shape checks. |
| auth middleware compatibility proof | FAIL | Verification halted before middleware compatibility checks. |
| frontend token storage proof | PASS | apps/web token storage/header wiring is present by static inspection. |
| required users ensured proof | FAIL | users:ensure-required could not complete due missing required SECURITY_VERIFY_* password env vars. |
| RBAC continuity proof | PASS | rbac-proof-bundle.json overallStatus=PASS |
| build proof | PASS | apps/api and apps/web build outputs exist. |
| verify proof | FAIL | Login verification blocked by missing required secrets. |

## User Login Proof

| User | Login | Token Issued | Token Shape | Middleware Compatibility | Role | Role Hydrated | Detail |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Commit Hash

- pending

