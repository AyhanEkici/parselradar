# Deployment Truth Proof Bundle

Generated at: 2026-05-20T21:12:29.154Z
Overall status: PASS

| Check | Status | Detail |
| --- | --- | --- |
| localHeadProof | PASS | local HEAD = cd6a05a4307d7e4c8cd1873f090132ce6dcd364a |
| originMainProof | PASS | origin/main HEAD = cd6a05a4307d7e4c8cd1873f090132ce6dcd364a |
| railwayHealthProof | PASS | /health reachable with status 200. |
| railwayGitShaProof | PASS | Railway /__buildinfo gitSha = cd6a05a4307d7e4c8cd1873f090132ce6dcd364a |
| commitAlignmentProof | PASS | Railway gitSha matches origin/main (cd6a05a4307d7e4c8cd1873f090132ce6dcd364a). |
| requiredCommit_fd956a58_Proof | PASS | fd956a58 is reachable in Railway gitSha cd6a05a4307d7e4c8cd1873f090132ce6dcd364a. |
| requiredCommit_80d94b53_Proof | PASS | 80d94b53 is reachable in Railway gitSha cd6a05a4307d7e4c8cd1873f090132ce6dcd364a. |
| requiredCommit_ce3d58db_Proof | PASS | ce3d58db is reachable in Railway gitSha cd6a05a4307d7e4c8cd1873f090132ce6dcd364a. |
| vercelLoginReachableProof | PASS | /login reachable on Vercel with status 200. |
| vercelActiveBundleProof | PASS | Active Vercel JS bundle = https://parselradar.vercel.app/assets/index-NritLOgX.js |
| vercelBundleAuthMarkerProof | PASS | Bundle fetched (status=200) and contains auth markers: parselradar_token, auth:changed, /auth/me, /credits |
| backendHealthReachableProof | PASS | Backend /health reachable. |

## Commit Hash

- cd6a05a4

