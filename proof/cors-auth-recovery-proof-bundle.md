# CORS Auth Recovery Proof Bundle

Generated at: 2026-05-20T08:47:57.803Z
Overall status: FAIL

| Check | Status | Detail |
| --- | --- | --- |
| activeApiTargetProof | PASS | Resolved active API target: https://parselradar-production.up.railway.app |
| targetReachabilityProof | PASS | Health probe succeeded for https://parselradar-production.up.railway.app. |
| resolvedApiTargetProof | PASS | Resolved active API target: https://parselradar-production.up.railway.app |
| corsConfigProof | PASS | CORS middleware uses explicit allow-logic and origin callback. |
| allowedOriginsProof | PASS | All required origins are explicitly whitelisted in API CORS config. |
| optionsPreflightProof | PASS | OPTIONS wildcard preflight handler with 204 success status is configured. |
| accessControlAllowOriginProof | PASS | CORS headers/methods config set for preflight and request flow. |
| credentialsTrueProof | PASS | credentials:true is enabled in CORS configuration. |
| vercelLoginProof | PASS | Preflight succeeded for https://parselradar.vercel.app with ACAO and credentials headers. |
| jwtIssuanceProof | FAIL | JWT issuance could not be validated for all users because bcrypt pre-checks did not pass. |
| sessionPersistenceProof | PASS | Auth hydration, persistence, stale-token cleanup, and Authorization header injection are present. |
| mahirIsolationProof | PASS | RBAC verifier confirms Mahir isolation controls. |
| adminVisibilityProof | PASS | RBAC verifier confirms admin-only visibility. |
| noPasswordResetProof | PASS | No known-user reset run detected in current proof set. |
| localPreflightProof | FAIL | Preflight for http://localhost:5173 status=500, acao=none, acc=none |
| railwayPreflightProof | FAIL | Preflight for https://parselradar-production.up.railway.app status=500, acao=none, acc=none |

## Commit Hash

- pending

