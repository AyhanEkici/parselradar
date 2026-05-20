# Login Proof Bundle

Generated at: 2026-05-20T01:48:25.051Z
Overall status: FAIL

| Check | Status | Detail |
| --- | --- | --- |
| loginRouteProof | PASS | Login and me routes are mounted. |
| mongoUserExistenceProof | PASS | All required users exist. |
| bcryptVerificationProof | FAIL | bcrypt compare failed for at least one required user. |
| jwtIssuanceProof | FAIL | JWT issuance could not be validated for all users because bcrypt pre-checks did not pass. |
| tokenVerificationProof | FAIL | Token verification failed or was not reachable for at least one required user. |
| frontendAuthPersistenceProof | PASS | Auth hydration, persistence, stale-token cleanup, and Authorization header injection are present. |
| roleHydrationProof | FAIL | Role mismatch or invalid role hydration detected. |
| pilotLoginProof | FAIL | Missing AUTH_RESET_PILOT_PASSWORD |
| ayhanLoginProof | FAIL | Missing AUTH_RESET_AYHAN_PASSWORD |
| mahirLoginProof | FAIL | Missing AUTH_RESET_MAHIR_PASSWORD |
| mahirIsolationProof | PASS | RBAC verifier confirms Mahir isolation controls. |
| adminVisibilityProof | PASS | RBAC verifier confirms admin-only visibility. |
| rootCauseProof | FAIL | missing_password_env_for_compare, role_hydration_mismatch |
| buildProof | PASS | apps/api and apps/web build artifacts exist. |
| verifyProof | FAIL | platform=WARN, rbac=PASS, diagnose=FAIL |
| repairProof | FAIL | Repair could not complete for all required users (missing passwords or unresolved lookup). |

## Commit Hash

- a61f599d5d96ae26c65ed99a1684d43989315cb3

