# Deployment Truth Proof Bundle

Generated at: 2026-05-21T21:35:51.789Z
Overall status: PASS

| Check | Status | Detail |
| --- | --- | --- |
| localHeadProof | PASS | local HEAD = a4442c335dfee6738d010a08b71fe4e7a4815187 |
| originMainProof | PASS | origin/main HEAD = a4442c335dfee6738d010a08b71fe4e7a4815187 |
| railwayHealthProof | PASS | /health reachable with status 200. |
| railwayGitShaProof | PASS | Railway /__buildinfo gitSha = a4442c335dfee6738d010a08b71fe4e7a4815187 |
| commitAlignmentProof | PASS | Railway gitSha matches origin/main (a4442c335dfee6738d010a08b71fe4e7a4815187). |
| requiredCommit_fd956a58_Proof | PASS | fd956a58 is reachable in Railway gitSha a4442c335dfee6738d010a08b71fe4e7a4815187. |
| requiredCommit_80d94b53_Proof | PASS | 80d94b53 is reachable in Railway gitSha a4442c335dfee6738d010a08b71fe4e7a4815187. |
| requiredCommit_ce3d58db_Proof | PASS | ce3d58db is reachable in Railway gitSha a4442c335dfee6738d010a08b71fe4e7a4815187. |
| vercelLoginReachableProof | PASS | /login reachable on Vercel with status 200. |
| vercelActiveBundleProof | PASS | Active Vercel JS bundle = https://parselradar.vercel.app/assets/index-BiIk5hmT.js |
| vercelBundleAuthMarkerProof | PASS | Bundle fetched (status=200) and contains auth markers: parselradar_token, auth:changed, /auth/me, /credits |
| backendHealthReachableProof | PASS | Backend /health reachable. |

## Commit Hash

- a4442c33

