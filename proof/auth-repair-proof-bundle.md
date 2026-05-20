# Auth Repair Proof Bundle

Generated at: 2026-05-20T01:02:49.973Z
Overall status: FAIL

| Check | Status | Detail |
| --- | --- | --- |
| bcryptCompatibilityProof | FAIL | bcrypt compare failed for at least one required user. |
| hashIntegrityProof | PASS | All password hashes match expected bcrypt prefix/cost format. |
| repairedUserProof | FAIL | Repair could not complete for all required users (missing passwords or unresolved lookup). |
| jwtIssuanceProof | FAIL | JWT issuance could not be validated for all users because bcrypt pre-checks did not pass. |
| tokenVerificationProof | FAIL | Token verification failed or was not reachable for at least one required user. |
| pilotLoginProof | FAIL | Missing AUTH_RESET_PILOT_PASSWORD |
| ayhanLoginProof | FAIL | Missing AUTH_RESET_AYHAN_PASSWORD |
| mahirLoginProof | FAIL | Missing AUTH_RESET_MAHIR_PASSWORD |
| frontendPersistenceProof | PASS | Auth hydration, persistence, stale-token cleanup, and Authorization header injection are present. |
| roleHydrationProof | FAIL | Role mismatch or invalid role hydration detected. |
| adminVisibilityProof | PASS | RBAC verifier confirms admin-only visibility. |
| mahirIsolationProof | PASS | RBAC verifier confirms Mahir isolation controls. |
| noOwnershipCorruptionProof | PASS | Mongo _id values preserved; ownership/reference continuity maintained. |
| buildProof | PASS | apps/api and apps/web build artifacts exist. |
| verifyProof | FAIL | platform=WARN, rbac=PASS, diagnose=FAIL |
| rootCauseProof | FAIL | missing_password_env_for_compare, role_hydration_mismatch |

## Commit Hash

- e277ab74bea5f116fb7772a469b82e1f1b05b676

