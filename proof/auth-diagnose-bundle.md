# Auth Diagnose Bundle

Generated at: 2026-05-20T01:02:45.596Z
Overall status: FAIL

## Proof Checks

| Check | Status | Detail |
| --- | --- | --- |
| Mongo user existence proof | PASS | All required users exist. |
| bcrypt verification proof | FAIL | bcrypt compare could not run for all users because required password env vars are missing. |
| JWT issuance proof | FAIL | JWT issuance could not be validated for all users because bcrypt pre-checks did not pass. |
| token verification proof | FAIL | Token verification failed or was not reachable for at least one required user. |
| frontend auth persistence proof | PASS | Auth context bootstrap, token persistence, bearer header injection, and invalid-token cleanup are present. |
| role hydration proof | FAIL | Role mismatch or invalid role hydration detected. |
| root cause proof | FAIL | missing_password_env_for_compare, role_hydration_mismatch |

## User Diagnostics

| User | Exists | Role | bcrypt compare | JWT issued | token verified | Hints |
| --- | --- | --- | --- | --- | --- | --- |
| pilot | true | ADMIN | skipped | false | false | missing_password_env_for_compare |
| AyhanEkici | true | USER | skipped | false | false | role_hydration_mismatch, missing_password_env_for_compare |
| Mahir | true | USER | skipped | false | false | missing_password_env_for_compare |

