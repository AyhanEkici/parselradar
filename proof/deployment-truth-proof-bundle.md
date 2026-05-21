# Deployment Truth Proof Bundle

Generated at: 2026-05-21T21:02:31.712Z
Overall status: PASS

| Check | Status | Detail |
| --- | --- | --- |
| localHeadProof | PASS | local HEAD = 38355679a8c5cda4122991a60ae8d8de2be0273d |
| originMainProof | PASS | origin/main HEAD = 38355679a8c5cda4122991a60ae8d8de2be0273d |
| railwayHealthProof | PASS | /health reachable with status 200. |
| railwayGitShaProof | PASS | Railway /__buildinfo gitSha = 38355679a8c5cda4122991a60ae8d8de2be0273d |
| commitAlignmentProof | PASS | Railway gitSha matches origin/main (38355679a8c5cda4122991a60ae8d8de2be0273d). |
| requiredCommit_fd956a58_Proof | PASS | fd956a58 is reachable in Railway gitSha 38355679a8c5cda4122991a60ae8d8de2be0273d. |
| requiredCommit_80d94b53_Proof | PASS | 80d94b53 is reachable in Railway gitSha 38355679a8c5cda4122991a60ae8d8de2be0273d. |
| requiredCommit_ce3d58db_Proof | PASS | ce3d58db is reachable in Railway gitSha 38355679a8c5cda4122991a60ae8d8de2be0273d. |
| vercelLoginReachableProof | PASS | /login reachable on Vercel with status 200. |
| vercelActiveBundleProof | PASS | Active Vercel JS bundle = https://parselradar.vercel.app/assets/index-CDA9urHY.js |
| vercelBundleAuthMarkerProof | PASS | Bundle fetched (status=200) and contains auth markers: parselradar_token, auth:changed, /auth/me, /credits |
| backendHealthReachableProof | PASS | Backend /health reachable. |

## Commit Hash

- 38355679

