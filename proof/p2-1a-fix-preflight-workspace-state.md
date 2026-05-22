# P2.1A-FIX Preflight Workspace State

- generatedAt: 2026-05-22T04:21:36.1803084+03:00
- modified files: 30
- untracked files: 22
- total dirty files: 52

## Command Output
### git status --short
```text
 M apps/api/dist/generated/buildInfo.js
 M apps/api/dist/testing/verifyConnectors.js
 M apps/api/scripts/verifyAdminUxAndEmail.ts
 M apps/api/scripts/verifyAuthUiConsistency.ts
 M apps/api/scripts/verifyBrowserHistoryConsistency.ts
 M apps/api/scripts/verifyNavigationPersistence.ts
 M apps/api/scripts/verifyPostLoginApiStability.ts
 M apps/api/src/generated/buildInfo.ts
 M apps/api/src/testing/verifyConnectors.ts
 M proof/auth-shell-consistency.json
 M proof/auth-shell-consistency.md
 M proof/browser-history-consistency.json
 M proof/browser-history-consistency.md
 M proof/canonical-auth-validation.json
 M proof/connector-diagnostics-audit.json
 M proof/connector-diagnostics-contract.json
 M proof/deployment-truth-proof-bundle.json
 M proof/deployment-truth-proof-bundle.md
 M proof/live-browser-mvp-proof-bundle.json
 M proof/live-browser-mvp-runtime.json
 M proof/navigation-persistence.json
 M proof/navigation-persistence.md
 M proof/ogc-diagnostics-ui-contract.json
 M proof/platform-integrity-audit.json
 M proof/platform-proof-bundle.json
 M proof/platform-proof-bundle.md
 M proof/platform-route-checks.json
 M proof/rbac-proof-bundle.json
 M proof/rbac-proof-bundle.md
 M proof/route-wiring-audit.json
?? apps/api/scripts/generateP21aDriftAudit.ts
?? apps/api/scripts/runP21aBaselineProof.ts
?? proof/ogc-deployed-browser-closeout-final-results.json
?? proof/ogc-deployed-browser-closeout-final-results.md
?? proof/ogc-live-after-deploy-payload.json
?? proof/ogc-live-after-deploy-payload.md
?? proof/ogc-live-browser-display-verification.json
?? proof/ogc-live-browser-display-verification.md
?? proof/p2-1a-command-results.json
?? proof/p2-1a-command-results.md
?? proof/p2-1a-drift-audit.json
?? proof/p2-1a-drift-audit.md
?? proof/p2-1c-file-classification.json
?? proof/p2-1c-file-classification.md
?? proof/p2-1c-final-command-results.json
?? proof/p2-1c-final-command-results.md
?? proof/p2-1c-no-drift-check.json
?? proof/p2-1c-no-drift-check.md
?? proof/p2-1c-platform-integrity-failure-analysis.json
?? proof/p2-1c-platform-integrity-failure-analysis.md
?? proof/p2-1c-workspace-state.json
?? proof/p2-1c-workspace-state.md
```
### git log --oneline -10
```text
655c864d docs: record Sahibinden source value gate
32e9d8a8 docs: define manual UCBP city exploration workflow
424a65e6 docs: define admin opportunity sourcing governance
d4a9b3d2 test: add MVP functional completeness audit
ed784c3d docs: record UCBP access constraints and matrix update
bea9e128 docs: add UCBP manual access check templates
77937f95 docs: define e-Devlet evidence and connector governance
8ef46bf6 test: add TUCBS candidate closeout proof
1d50242a test: close platform integrity baseline proof
d2851fb9 fix: render missing OGC endpoints as not configured
```
### git diff --name-status
```text
M	apps/api/dist/generated/buildInfo.js
M	apps/api/dist/testing/verifyConnectors.js
M	apps/api/scripts/verifyAdminUxAndEmail.ts
M	apps/api/scripts/verifyAuthUiConsistency.ts
M	apps/api/scripts/verifyBrowserHistoryConsistency.ts
M	apps/api/scripts/verifyNavigationPersistence.ts
M	apps/api/scripts/verifyPostLoginApiStability.ts
M	apps/api/src/generated/buildInfo.ts
M	apps/api/src/testing/verifyConnectors.ts
M	proof/auth-shell-consistency.json
M	proof/auth-shell-consistency.md
M	proof/browser-history-consistency.json
M	proof/browser-history-consistency.md
M	proof/canonical-auth-validation.json
M	proof/connector-diagnostics-audit.json
M	proof/connector-diagnostics-contract.json
M	proof/deployment-truth-proof-bundle.json
M	proof/deployment-truth-proof-bundle.md
M	proof/live-browser-mvp-proof-bundle.json
M	proof/live-browser-mvp-runtime.json
M	proof/navigation-persistence.json
M	proof/navigation-persistence.md
M	proof/ogc-diagnostics-ui-contract.json
M	proof/platform-integrity-audit.json
M	proof/platform-proof-bundle.json
M	proof/platform-proof-bundle.md
M	proof/platform-route-checks.json
M	proof/rbac-proof-bundle.json
M	proof/rbac-proof-bundle.md
M	proof/route-wiring-audit.json
```
### git diff --stat
```text
 apps/api/dist/generated/buildInfo.js               |   4 +-
 apps/api/dist/testing/verifyConnectors.js          |   3 +-
 apps/api/scripts/verifyAdminUxAndEmail.ts          |   2 +-
 apps/api/scripts/verifyAuthUiConsistency.ts        |   2 +-
 .../api/scripts/verifyBrowserHistoryConsistency.ts |   5 +-
 apps/api/scripts/verifyNavigationPersistence.ts    |   5 +-
 apps/api/scripts/verifyPostLoginApiStability.ts    |   7 +-
 apps/api/src/generated/buildInfo.ts                |   4 +-
 apps/api/src/testing/verifyConnectors.ts           |   5 +-
 proof/auth-shell-consistency.json                  |   6 +-
 proof/auth-shell-consistency.md                    |   4 +-
 proof/browser-history-consistency.json             |   6 +-
 proof/browser-history-consistency.md               |   4 +-
 proof/canonical-auth-validation.json               |   2 +-
 proof/connector-diagnostics-audit.json             |   2 +-
 proof/connector-diagnostics-contract.json          |   2 +-
 proof/deployment-truth-proof-bundle.json           |  20 +-
 proof/deployment-truth-proof-bundle.md             |  20 +-
 proof/live-browser-mvp-proof-bundle.json           |   8 +-
 proof/live-browser-mvp-runtime.json                | 136 ++++++++----
 proof/navigation-persistence.json                  |   8 +-
 proof/navigation-persistence.md                    |   6 +-
 proof/ogc-diagnostics-ui-contract.json             |   2 +-
 proof/platform-integrity-audit.json                |   2 +-
 proof/platform-proof-bundle.json                   | 228 ++++++++++++++++++++-
 proof/platform-proof-bundle.md                     |   4 +-
 proof/platform-route-checks.json                   | 112 ++++++++++
 proof/rbac-proof-bundle.json                       |   2 +-
 proof/rbac-proof-bundle.md                         |   2 +-
 proof/route-wiring-audit.json                      | 110 ++++++++--
 30 files changed, 600 insertions(+), 123 deletions(-)
```

## Classification
### EXISTING_INTENTIONAL_PROOF_OUTPUT
- proof/auth-shell-consistency.json
- proof/auth-shell-consistency.md
- proof/browser-history-consistency.json
- proof/browser-history-consistency.md
- proof/canonical-auth-validation.json
- proof/connector-diagnostics-audit.json
- proof/connector-diagnostics-contract.json
- proof/deployment-truth-proof-bundle.json
- proof/deployment-truth-proof-bundle.md
- proof/live-browser-mvp-proof-bundle.json
- proof/live-browser-mvp-runtime.json
- proof/navigation-persistence.json
- proof/navigation-persistence.md
- proof/ogc-diagnostics-ui-contract.json
- proof/platform-integrity-audit.json
- proof/platform-proof-bundle.json
- proof/platform-proof-bundle.md
- proof/platform-route-checks.json
- proof/rbac-proof-bundle.json
- proof/rbac-proof-bundle.md
- proof/route-wiring-audit.json
- proof/ogc-deployed-browser-closeout-final-results.json
- proof/ogc-deployed-browser-closeout-final-results.md
- proof/ogc-live-after-deploy-payload.json
- proof/ogc-live-after-deploy-payload.md
- proof/ogc-live-browser-display-verification.json
- proof/ogc-live-browser-display-verification.md
- proof/p2-1a-command-results.json
- proof/p2-1a-command-results.md
- proof/p2-1a-drift-audit.json
- proof/p2-1a-drift-audit.md
- proof/p2-1c-file-classification.json
- proof/p2-1c-file-classification.md
- proof/p2-1c-final-command-results.json
- proof/p2-1c-final-command-results.md
- proof/p2-1c-no-drift-check.json
- proof/p2-1c-no-drift-check.md
- proof/p2-1c-platform-integrity-failure-analysis.json
- proof/p2-1c-platform-integrity-failure-analysis.md
- proof/p2-1c-workspace-state.json
- proof/p2-1c-workspace-state.md
### EXISTING_HELPER_SCRIPT
- apps/api/dist/generated/buildInfo.js
- apps/api/dist/testing/verifyConnectors.js
- apps/api/scripts/verifyAdminUxAndEmail.ts
- apps/api/scripts/verifyAuthUiConsistency.ts
- apps/api/scripts/verifyBrowserHistoryConsistency.ts
- apps/api/scripts/verifyNavigationPersistence.ts
- apps/api/scripts/verifyPostLoginApiStability.ts
- apps/api/src/generated/buildInfo.ts
- apps/api/src/testing/verifyConnectors.ts
- apps/api/scripts/generateP21aDriftAudit.ts
- apps/api/scripts/runP21aBaselineProof.ts
### REQUIRED_P2_1A_FIX
- (none)
### REQUIRED_P2_1A_PROOF
- proof/p2-1a-fix-preflight-workspace-state.json
- proof/p2-1a-fix-preflight-workspace-state.md
- proof/p2-1a-fix-no-drift-check.json
- proof/p2-1a-fix-no-drift-check.md
- proof/p2-1a-fix-baseline-command-results.json
- proof/p2-1a-fix-baseline-command-results.md
- proof/p2-1a-fix-stripe-checkout-contract.json
- proof/p2-1a-fix-stripe-checkout-contract.md
- proof/p2-1a-fix-api-group-reconciliation.json
- proof/p2-1a-fix-api-group-reconciliation.md
- proof/p2-1a-fix-admin-property-documents-route.json
- proof/p2-1a-fix-admin-property-documents-route.md
- proof/p2-1a-fix-targeted-command-results.json
- proof/p2-1a-fix-targeted-command-results.md
- proof/p2-1a-fix-final-command-results.json
- proof/p2-1a-fix-final-command-results.md
### ACCIDENTAL_NOISE
- (none)
### UNKNOWN_REQUIRES_REVIEW
- (none)

## Preflight Gate
- unknown files staged: no
- instruction: do not stage unknown files
