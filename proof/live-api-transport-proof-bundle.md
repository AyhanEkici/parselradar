# Live API Transport Proof Bundle

Generated at: 2026-05-20T12:56:59.718Z
Overall status: PASS
Active target: https://parselradar-production.up.railway.app

| Check | Status | Detail |
| --- | --- | --- |
| railwayActiveDeploymentProof | PASS | JSON response received. |
| activeApiUrlProof | PASS | Active API URL resolved to https://parselradar-production.up.railway.app |
| healthProof | PASS | JSON response received. |
| buildInfoProof | PASS | JSON response received. |
| authLoginOptionsProof | PASS | OPTIONS /auth/login returned JSON-capable preflight headers. |
| forgotPasswordOptionsProof | PASS | OPTIONS /auth/forgot-password returned JSON-capable preflight headers. |
| resetPasswordOptionsProof | PASS | OPTIONS /auth/reset-password returned JSON-capable preflight headers. |
| accessControlAllowOriginProof | PASS | Observed ACAO values: login=https://parselradar.vercel.app, forgot=https://parselradar.vercel.app, reset=https://parselradar.vercel.app |
| credentialsHeaderProof | PASS | Observed ACC values: login=true, forgot=true, reset=true |
| allowedHeadersProof | PASS | Observed ACAH values: login=Content-Type,Authorization,X-Request-Id, forgot=Content-Type,Authorization,X-Request-Id, reset=Content-Type,Authorization,X-Request-Id |
| allowedMethodsProof | PASS | Observed ACAM values: login=GET,POST,PUT,PATCH,DELETE,OPTIONS, forgot=GET,POST,PUT,PATCH,DELETE,OPTIONS, reset=GET,POST,PUT,PATCH,DELETE,OPTIONS |
| forgotPasswordLiveProof | PASS | POST /auth/forgot-password returned a JSON response with Vercel origin. |
| noHtmlResponseProof | PASS | Checked that API endpoints did not return HTML bodies. |
| buildInfoVisibleProof | PASS | Build info endpoint responded with JSON. |
| vercelViteApiUrlProof | PASS | Frontend API client points to the active Railway URL without a trailing slash. |

## Commit Hash

- pending

