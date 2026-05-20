# CORS Auth Recovery Proof Bundle

Generated at: 2026-05-20T02:13:59.641Z
Overall status: FAIL

| Check | Status | Detail |
| --- | --- | --- |
| activeApiTargetProof | PASS | Resolved active API target: https://parselradar-production.up.railway.app |
| targetReachabilityProof | FAIL | No active API target responded to /health. |
| resolvedApiTargetProof | PASS | Resolved active API target: https://parselradar-production.up.railway.app |
| corsConfigProof | PASS | CORS middleware uses explicit allow-logic and origin callback. |
| allowedOriginsProof | PASS | All required origins are explicitly whitelisted in API CORS config. |
| optionsPreflightProof | PASS | OPTIONS wildcard preflight handler with 204 success status is configured. |
| accessControlAllowOriginProof | PASS | CORS headers/methods config set for preflight and request flow. |
| credentialsTrueProof | PASS | credentials:true is enabled in CORS configuration. |
| vercelLoginProof | FAIL | Preflight for https://parselradar.vercel.app status=502, acao=none, acc=none |
| jwtIssuanceProof | FAIL | JWT issuance could not be validated for all users because bcrypt pre-checks did not pass. |
| sessionPersistenceProof | PASS | Auth hydration, persistence, stale-token cleanup, and Authorization header injection are present. |
| mahirIsolationProof | PASS | RBAC verifier confirms Mahir isolation controls. |
| adminVisibilityProof | PASS | RBAC verifier confirms admin-only visibility. |
| noPasswordResetProof | PASS | No known-user reset run detected in current proof set. |
| localPreflightProof | FAIL | Preflight for http://localhost:5173 status=502, acao=none, acc=none |
| railwayPreflightProof | FAIL | Preflight for https://parselradar-production.up.railway.app status=502, acao=none, acc=none |

## Commit Hash

- 2293328de35faf810db87ba67fad89fba7a24028

