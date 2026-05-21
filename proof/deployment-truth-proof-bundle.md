# Deployment Truth Proof Bundle

Generated at: 2026-05-21T21:48:35.739Z
Overall status: PASS

| Check | Status | Detail |
| --- | --- | --- |
| localHeadProof | PASS | local HEAD = f8307b5665003cc4b3b3d8fe39c2666ac68d3003 |
| originMainProof | PASS | origin/main HEAD = f8307b5665003cc4b3b3d8fe39c2666ac68d3003 |
| railwayHealthProof | PASS | /health reachable with status 200. |
| railwayGitShaProof | PASS | Railway /__buildinfo gitSha = f8307b5665003cc4b3b3d8fe39c2666ac68d3003 |
| commitAlignmentProof | PASS | Railway gitSha matches origin/main (f8307b5665003cc4b3b3d8fe39c2666ac68d3003). |
| requiredCommit_fd956a58_Proof | PASS | fd956a58 is reachable in Railway gitSha f8307b5665003cc4b3b3d8fe39c2666ac68d3003. |
| requiredCommit_80d94b53_Proof | PASS | 80d94b53 is reachable in Railway gitSha f8307b5665003cc4b3b3d8fe39c2666ac68d3003. |
| requiredCommit_ce3d58db_Proof | PASS | ce3d58db is reachable in Railway gitSha f8307b5665003cc4b3b3d8fe39c2666ac68d3003. |
| vercelLoginReachableProof | PASS | /login reachable on Vercel with status 200. |
| vercelActiveBundleProof | PASS | Active Vercel JS bundle = https://parselradar.vercel.app/assets/index-Dd-NTmJk.js |
| vercelBundleAuthMarkerProof | PASS | Bundle fetched (status=200) and contains auth markers: parselradar_token, auth:changed, /auth/me, /credits |
| backendHealthReachableProof | PASS | Backend /health reachable. |

## Commit Hash

- f8307b56

