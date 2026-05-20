# Deployment Truth Proof Bundle

Generated at: 2026-05-20T18:46:05.042Z
Overall status: FAIL

| Check | Status | Detail |
| --- | --- | --- |
| localHeadProof | PASS | local HEAD = ce3d58db78ade49d1373547f2162e03cdc1ba51f |
| originMainProof | PASS | origin/main HEAD = ce3d58db78ade49d1373547f2162e03cdc1ba51f |
| railwayHealthProof | PASS | /health reachable with status 200. |
| railwayGitShaProof | PASS | Railway /__buildinfo gitSha = fd403486e4a3ac87a35efb8aef9629f80e0bf269 |
| commitAlignmentProof | FAIL | Mismatch: local=ce3d58db78ade49d1373547f2162e03cdc1ba51f, origin/main=ce3d58db78ade49d1373547f2162e03cdc1ba51f, railway=fd403486e4a3ac87a35efb8aef9629f80e0bf269 |
| requiredCommit_fd956a58_Proof | WARN | Could not prove ancestry for fd956a58 -> fd403486e4a3ac87a35efb8aef9629f80e0bf269 (missing commit locally). |
| requiredCommit_80d94b53_Proof | PASS | 80d94b53 is reachable in Railway gitSha fd403486e4a3ac87a35efb8aef9629f80e0bf269. |
| requiredCommit_ce3d58db_Proof | WARN | Could not prove ancestry for ce3d58db -> fd403486e4a3ac87a35efb8aef9629f80e0bf269 (missing commit locally). |
| vercelLoginReachableProof | PASS | /login reachable on Vercel with status 200. |
| vercelActiveBundleProof | PASS | Active Vercel JS bundle = https://parselradar.vercel.app/assets/index-CH6d1mVW.js |
| vercelBundleAuthMarkerProof | PASS | Bundle fetched (status=200) and contains auth markers: parselradar_token, auth:changed, /auth/me, /credits |
| backendHealthReachableProof | PASS | Backend /health reachable. |
| liveAuthContractProof | FAIL | verify:live-login-contract returned 401 on /auth/me with backendReason=TOKEN_VERIFIED_POST_CHECK_FAILED while Railway gitSha is behind origin/main. |
| postLoginStabilityProof | PASS | verify:post-login-api passed (8/8). |
| rbacContinuityProof | PASS | verify:rbac passed (57/57). |

## Final Next Action

- Alignment FAIL: local/origin=ce3d58db and Railway=fd403486.
- Force Railway redeploy and wait until /__buildinfo gitSha equals origin/main before interpreting runtime auth failures.
- Do not continue behavior-level debugging until commit alignment is restored.

## Commit Hash

- ce3d58db

