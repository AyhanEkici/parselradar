# Railway Runtime Proof Bundle

Generated at: 2026-05-20T09:01:34.046Z
Overall status: PASS
Active target: https://parselradar-production.up.railway.app

| Check | Status | Detail |
| --- | --- | --- |
| activeTargetProof | PASS | Resolved active Railway target: https://parselradar-production.up.railway.app |
| targetHealthProof | PASS | JSON response received. |
| healthEndpointProof | PASS | JSON response received. |
| buildInfoEndpointProof | PASS | JSON response received. |
| loginPreflightProof | PASS | Preflight returned an expected CORS status. |
| forgotPreflightProof | PASS | Preflight returned an expected CORS status. |
| resetPreflightProof | PASS | Preflight returned an expected CORS status. |
| forgotPostProof | PASS | POST /auth/forgot-password returned 200 (route is mounted) |
| resetPostProof | PASS | POST /auth/reset-password returned 400 (route is mounted) |
| runtimeBootProof | PASS | Local runtime boot proof is passing. |
| liveApiTransportProof | WARN | Live API transport proof is missing or not passing. |
| originHeaderProof | PASS | Observed ACAO headers: login=https://parselradar.vercel.app, forgot=https://parselradar.vercel.app, reset=https://parselradar.vercel.app |
| credentialsHeaderProof | PASS | Observed ACC headers: login=true, forgot=true, reset=true |
| allowedMethodsProof | PASS | Observed ACAM headers: login=GET,POST,PUT,PATCH,DELETE,OPTIONS, forgot=GET,POST,PUT,PATCH,DELETE,OPTIONS, reset=GET,POST,PUT,PATCH,DELETE,OPTIONS |
| allowedHeadersProof | PASS | Observed ACAH headers: login=Content-Type,Authorization,X-Request-Id, forgot=Content-Type,Authorization,X-Request-Id, reset=Content-Type,Authorization,X-Request-Id |
| noHtmlResponseProof | PASS | Checked that the runtime endpoints did not return HTML bodies. |

## Commit Hash

- pending

