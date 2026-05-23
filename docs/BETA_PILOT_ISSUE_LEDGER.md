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
| PR-BETA-001 | 2026-05-23 | security.retest.20260523@example.com | TESTER | Readiness/Report | P2_PRODUCT_ISSUE | https://parselradar.vercel.app/properties/6a10f759a8b3299fd6fa9401/result | Readiness summary blocks should match per-analysis state cards | Same screen shows "Parsel kimligi gerekli" and "Belediye/imar kaniti gerekli" while footer chips show "Parsel Insight: Hazir" and "Developer Fit: Hazir" | OPEN | Product+API | P2.BETA-5 | Confusing mixed-state messaging may cause wrong go/no-go understanding |
| PR-BETA-002 | 2026-05-23 | security.retest.20260523@example.com | TESTER | Auth/Login Copy | P3_POLISH | https://parselradar.vercel.app/login | Login helper links should be consistent Turkish UX copy | "Wachtwoord vergeten?" appears in Dutch on Turkish login screen | OPEN | Web UX | P2.BETA-5 | Copy inconsistency creates trust/confusion issue for first-time testers |

## Usage Rules
- Create one row per reproducible finding.
- Link the exact URL and include minimal reproduction notes.
- Update status and owner during triage.
- Keep P0_BLOCKER and P1_FLOW_BLOCKER items visible until VERIFIED or WONT_FIX.
