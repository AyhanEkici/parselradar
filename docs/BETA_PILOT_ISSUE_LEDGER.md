# BETA PILOT ISSUE LEDGER

Use this ledger to record findings from the first known tester pilot run.

## Severity Options
- P0_BLOCKER
- P1_FLOW_BLOCKER
- P2_PRODUCT_ISSUE
- P3_POLISH
- P4_IDEA

## Status Options
- OPEN
- TRIAGED
- FIXING
- FIXED
- VERIFIED
- WONT_FIX

## Ledger
| ID | Date | Reporter | Role | Area | Severity | URL | Expected | Actual | Status | Owner | Fix phase | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PR-BETA-001 | YYYY-MM-DD | <name> | TESTER | Auth/Login | P2_PRODUCT_ISSUE | <url> | Successful login and redirect to intended page | <actual behavior> | OPEN | <owner> | P2.BETA-x | <notes> |
| PR-BETA-002 | YYYY-MM-DD | <name> | ADMIN | Admin CMS Access Control | P1_FLOW_BLOCKER | <url> | Normal users cannot access /admin/cms | <actual behavior> | OPEN | <owner> | P2.BETA-x | <notes> |
| PR-BETA-003 | YYYY-MM-DD | <name> | TESTER | Readiness/Report | P2_PRODUCT_ISSUE | <url> | Readiness/report messages are accurate | <actual behavior> | OPEN | <owner> | P2.BETA-x | <notes> |

## Usage Rules
- Create one row per reproducible finding.
- Link the exact URL and include minimal reproduction notes.
- Update status and owner during triage.
- Keep P0_BLOCKER and P1_FLOW_BLOCKER items visible until VERIFIED or WONT_FIX.
