# P2.2A-LITE Closeout File Classification

Allowed for commit:
- `REQUIRED_TUCBS_TEST_SCRIPT`
- `REQUIRED_TUCBS_PROOF`
- `REQUIRED_P2_2A_CLOSEOUT_PROOF`

Buckets:
- `REQUIRED_TUCBS_TEST_SCRIPT`: `apps/api/scripts/testTucbsCandidateEndpoints.ts`, `package.json`
- `REQUIRED_TUCBS_PROOF`: `proof/tucbs-candidate-endpoint-test-results.json`, `proof/tucbs-candidate-endpoint-test-results.md`
- `REQUIRED_P2_2A_CLOSEOUT_PROOF`: the new workspace snapshot, test artifact review, no-drift check, classification, and final command results files
- `BASELINE_PROOF_OUTPUT`: prior baseline proof outputs that must stay uncommitted
- `PREVIOUS_SESSION_PROOF_OUTPUT`: earlier P2.1A/P2.1C/OGC proof outputs that are not needed for this closeout
- `HELPER_SCRIPT_FROM_PRIOR_PHASE`: P2.1A helper scripts
- `ACCIDENTAL_NOISE`: generated build artifacts and older verifier script edits
- `UNKNOWN_REQUIRES_REVIEW`: none

Decision:
- only the current TUCBS probe artifacts and new P2.2A-LITE closeout files are eligible for staging
- all prior-session noise remains out of the commit
