# Deployment Truth Proof Bundle

Generated at: 2026-05-22T20:48:06.980Z
Overall status: PASS

| Check | Status | Detail |
| --- | --- | --- |
| localHeadProof | PASS | local HEAD = 8876ae4f73fd32afbb418d1a5209cbcaf0e41df5 |
| originMainProof | PASS | origin/main HEAD = 8876ae4f73fd32afbb418d1a5209cbcaf0e41df5 |
| railwayHealthProof | PASS | /health reachable with status 200. |
| railwayGitShaProof | PASS | Railway /__buildinfo gitSha = 8876ae4f73fd32afbb418d1a5209cbcaf0e41df5 |
| commitAlignmentProof | PASS | Railway gitSha matches origin/main (8876ae4f73fd32afbb418d1a5209cbcaf0e41df5). |
| requiredCommit_fd956a58_Proof | PASS | fd956a58 is reachable in Railway gitSha 8876ae4f73fd32afbb418d1a5209cbcaf0e41df5. |
| requiredCommit_80d94b53_Proof | PASS | 80d94b53 is reachable in Railway gitSha 8876ae4f73fd32afbb418d1a5209cbcaf0e41df5. |
| requiredCommit_ce3d58db_Proof | PASS | ce3d58db is reachable in Railway gitSha 8876ae4f73fd32afbb418d1a5209cbcaf0e41df5. |
| vercelLoginReachableProof | PASS | /login reachable on Vercel with status 200. |
| vercelActiveBundleProof | PASS | Active Vercel JS bundle = https://parselradar.vercel.app/assets/index-BHpnDTOZ.js |
| vercelBundleAuthMarkerProof | PASS | Bundle fetched (status=200) and contains auth markers: parselradar_token, auth:changed, /auth/me, /credits |
| backendHealthReachableProof | PASS | Backend /health reachable. |

## Commit Hash

- 8876ae4f

