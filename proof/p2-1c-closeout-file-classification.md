# P2.1C Closeout File Classification

Allowed for commit:
- `REQUIRED_P2_1C_PROOF`

Buckets:
- `REQUIRED_P2_1C_PROOF`: closeout workspace state, closeout classification, closeout no-drift, closeout final command results, and the prior P2.1C final command results artifact
- `REQUIRED_OGC_PROOF`: OGC contract, deployment truth, browser display, and closeout payload artifacts
- `BASELINE_PROOF_OUTPUT`: auth, navigation, RBAC, route wiring, and platform baseline proof artifacts
- `PREVIOUS_SESSION_PROOF_OUTPUT`: prior P2.1A/P2.1C proof outputs that should remain uncommitted
- `PREVIOUS_SESSION_PROOF_OUTPUT`: prior P2.1A/P2.1C proof outputs that should remain uncommitted, including the earlier P2.1C workspace/classification/no-drift/failure-analysis bundle
- `HELPER_SCRIPT_FROM_PRIOR_PHASE`: the prior P2.1A helper scripts
- `ACCIDENTAL_NOISE`: generated build artifacts and verifier script edits
- `UNKNOWN_REQUIRES_REVIEW`: none

Decision:
- only the P2.1C closeout proof files are eligible for staging
- the remaining dirty files are intentionally left out of the commit