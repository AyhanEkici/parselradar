# Deployment Truth Proof Bundle

Generated at: 2026-05-20T20:35:40.084Z
Overall status: PASS

| Check | Status | Detail |
| --- | --- | --- |
| localHeadProof | PASS | local HEAD = 52698b44f5af2bc7c10794f67a6e8146f19cdcba |
| originMainProof | PASS | origin/main HEAD = 52698b44f5af2bc7c10794f67a6e8146f19cdcba |
| railwayHealthProof | PASS | /health reachable with status 200. |
| railwayGitShaProof | PASS | Railway /__buildinfo gitSha = 52698b44f5af2bc7c10794f67a6e8146f19cdcba |
| commitAlignmentProof | PASS | Railway gitSha matches origin/main (52698b44f5af2bc7c10794f67a6e8146f19cdcba). |
| requiredCommit_fd956a58_Proof | PASS | fd956a58 is reachable in Railway gitSha 52698b44f5af2bc7c10794f67a6e8146f19cdcba. |
| requiredCommit_80d94b53_Proof | PASS | 80d94b53 is reachable in Railway gitSha 52698b44f5af2bc7c10794f67a6e8146f19cdcba. |
| requiredCommit_ce3d58db_Proof | PASS | ce3d58db is reachable in Railway gitSha 52698b44f5af2bc7c10794f67a6e8146f19cdcba. |
| vercelLoginReachableProof | PASS | /login reachable on Vercel with status 200. |
| vercelActiveBundleProof | PASS | Active Vercel JS bundle = https://parselradar.vercel.app/assets/index-DeZLTan0.js |
| vercelBundleAuthMarkerProof | PASS | Bundle fetched (status=200) and contains auth markers: parselradar_token, auth:changed, /auth/me, /credits |
| backendHealthReachableProof | PASS | Backend /health reachable. |

## Commit Hash

- 52698b44

