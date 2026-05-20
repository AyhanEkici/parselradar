# Deployment Truth Proof Bundle

Generated at: 2026-05-20T22:01:15.998Z
Overall status: PASS

| Check | Status | Detail |
| --- | --- | --- |
| localHeadProof | PASS | local HEAD = 0b7e3ec49e408d256e4d051d8cb8c0e0c19e12a4 |
| originMainProof | PASS | origin/main HEAD = 0b7e3ec49e408d256e4d051d8cb8c0e0c19e12a4 |
| railwayHealthProof | PASS | /health reachable with status 200. |
| railwayGitShaProof | PASS | Railway /__buildinfo gitSha = 0b7e3ec49e408d256e4d051d8cb8c0e0c19e12a4 |
| commitAlignmentProof | PASS | Railway gitSha matches origin/main (0b7e3ec49e408d256e4d051d8cb8c0e0c19e12a4). |
| requiredCommit_fd956a58_Proof | PASS | fd956a58 is reachable in Railway gitSha 0b7e3ec49e408d256e4d051d8cb8c0e0c19e12a4. |
| requiredCommit_80d94b53_Proof | PASS | 80d94b53 is reachable in Railway gitSha 0b7e3ec49e408d256e4d051d8cb8c0e0c19e12a4. |
| requiredCommit_ce3d58db_Proof | PASS | ce3d58db is reachable in Railway gitSha 0b7e3ec49e408d256e4d051d8cb8c0e0c19e12a4. |
| vercelLoginReachableProof | PASS | /login reachable on Vercel with status 200. |
| vercelActiveBundleProof | PASS | Active Vercel JS bundle = https://parselradar.vercel.app/assets/index-DPVVs9iO.js |
| vercelBundleAuthMarkerProof | PASS | Bundle fetched (status=200) and contains auth markers: parselradar_token, auth:changed, /auth/me, /credits |
| backendHealthReachableProof | PASS | Backend /health reachable. |

## Commit Hash

- 0b7e3ec4

