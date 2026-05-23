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
| PR-BETA-001 | 2026-05-23 | security.retest.20260523@example.com | TESTER | Readiness/Report | P2_PRODUCT_ISSUE | https://parselradar.vercel.app/properties/6a10f759a8b3299fd6fa9401/result | Readiness summary blocks should match per-analysis state cards | Same screen shows "Parsel kimligi gerekli" and "Belediye/imar kaniti gerekli" while footer chips show "Parsel Insight: Hazir" and "Developer Fit: Hazir" | TRIAGED | Product+API | P2.BETA-6 | Continue beta with monitoring for 2-3 testers; not a core-flow blocker but should be fixed before wider pilot |
| PR-BETA-002 | 2026-05-23 | security.retest.20260523@example.com | TESTER | Auth/Login Copy | P3_POLISH | https://parselradar.vercel.app/login | Login helper links should be consistent Turkish UX copy | "Wachtwoord vergeten?" appears in Dutch on Turkish login screen | TRIAGED | Web UX | P2.BETA-7 | Future polish; does not block 2-3 tester expansion |

## Usage Rules
- Create one row per reproducible finding.
- Link the exact URL and include minimal reproduction notes.
- Update status and owner during triage.
- Keep P0_BLOCKER and P1_FLOW_BLOCKER items visible until VERIFIED or WONT_FIX.

## P2.BETA-PILOT-2 - Real Controlled Beta Tester Round

Use the table below for real-tester onboarding round tracking. Do not invent tester feedback; use placeholders until real tester execution starts.

| Tester ID / alias | Date | Role | Device | Flow completed | Issue summary | Severity P0/P1/P2/P3 | Status OPEN/TRIAGED/FIXED/DEFERRED | Owner | Fix phase | Expand testers allowed: yes/no | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TBD-TESTER-01 | TBD | Buyer/Investor | TBD | TBD | Placeholder only - waiting for real tester run | TBD | OPEN | TBD | P2.BETA-PILOT-2 | no | Replace with real observation after session |
| TBD-TESTER-02 | TBD | Buyer/Investor | TBD | TBD | Placeholder only - waiting for real tester run | TBD | OPEN | TBD | P2.BETA-PILOT-2 | no | Replace with real observation after session |
| TBD-TESTER-03 | TBD | Professional/Agent (if available) | TBD | TBD | Placeholder only - waiting for real tester run | TBD | OPEN | TBD | P2.BETA-PILOT-2 | no | Optional third tester slot |
