# Live API Transport Proof Bundle

Generated at: 2026-05-20T02:16:24.478Z
Overall status: FAIL
Active target: https://parselradar-production.up.railway.app

| Check | Status | Detail |
| --- | --- | --- |
| railwayActiveDeploymentProof | FAIL | No candidate responded with JSON health. |
| activeApiUrlProof | PASS | Active API URL resolved to https://parselradar-production.up.railway.app |
| healthProof | FAIL | Unexpected response status=502, contentType=application/json |
| buildInfoProof | FAIL | Unexpected response status=502, contentType=application/json |
| authLoginOptionsProof | FAIL | Unexpected response status=502, contentType=application/json |
| forgotPasswordOptionsProof | FAIL | Unexpected response status=502, contentType=application/json |
| resetPasswordOptionsProof | FAIL | Unexpected response status=502, contentType=application/json |
| accessControlAllowOriginProof | FAIL | Observed ACAO values: login=none, forgot=none, reset=none |
| credentialsHeaderProof | FAIL | Observed ACC values: login=none, forgot=none, reset=none |
| allowedHeadersProof | FAIL | Observed ACAH values: login=none, forgot=none, reset=none |
| allowedMethodsProof | FAIL | Observed ACAM values: login=none, forgot=none, reset=none |
| forgotPasswordLiveProof | FAIL | Unexpected response status=502, contentType=application/json |
| noHtmlResponseProof | PASS | Checked that API endpoints did not return HTML bodies. |
| buildInfoVisibleProof | FAIL | Unexpected response status=502, contentType=application/json |
| vercelViteApiUrlProof | PASS | Frontend API client points to the active Railway URL without a trailing slash. |

## Commit Hash

- 2293328de35faf810db87ba67fad89fba7a24028

