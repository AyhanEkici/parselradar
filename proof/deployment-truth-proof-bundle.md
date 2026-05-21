# Deployment Truth Proof Bundle

Generated at: 2026-05-21T21:16:02.190Z
Overall status: PASS

| Check | Status | Detail |
| --- | --- | --- |
| localHeadProof | PASS | local HEAD = 4b0d7089b3c254795ef36170841c9842117cb4c2 |
| originMainProof | PASS | origin/main HEAD = 4b0d7089b3c254795ef36170841c9842117cb4c2 |
| railwayHealthProof | PASS | /health reachable with status 200. |
| railwayGitShaProof | PASS | Railway /__buildinfo gitSha = 4b0d7089b3c254795ef36170841c9842117cb4c2 |
| commitAlignmentProof | PASS | Railway gitSha matches origin/main (4b0d7089b3c254795ef36170841c9842117cb4c2). |
| requiredCommit_fd956a58_Proof | PASS | fd956a58 is reachable in Railway gitSha 4b0d7089b3c254795ef36170841c9842117cb4c2. |
| requiredCommit_80d94b53_Proof | PASS | 80d94b53 is reachable in Railway gitSha 4b0d7089b3c254795ef36170841c9842117cb4c2. |
| requiredCommit_ce3d58db_Proof | PASS | ce3d58db is reachable in Railway gitSha 4b0d7089b3c254795ef36170841c9842117cb4c2. |
| vercelLoginReachableProof | PASS | /login reachable on Vercel with status 200. |
| vercelActiveBundleProof | PASS | Active Vercel JS bundle = https://parselradar.vercel.app/assets/index-1lj2uiCq.js |
| vercelBundleAuthMarkerProof | PASS | Bundle fetched (status=200) and contains auth markers: parselradar_token, auth:changed, /auth/me, /credits |
| backendHealthReachableProof | PASS | Backend /health reachable. |

## Commit Hash

- 4b0d7089

