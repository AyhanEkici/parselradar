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
| PR-PROD-001 | 2026-05-24 | founder.walkthrough.agent | AGENT | Route consistency | P1_FLOW_BLOCKER | https://parselradar.vercel.app/properties/6a09317e90f79b455480b80e/report | Property report CTA/path should resolve to an existing report surface | Added frontend route alias `/properties/:id/report` -> `PropertyResult` route surface (`/properties/:id/result` behavior preserved) | FIXED | Web UX | P2.PRODUCT-FIRST-IMPRESSION-2 | Route alias added only; no report logic changes and no backend/API changes |
| PR-PROD-002 | 2026-05-25 | founder.walkthrough.agent | AGENT | Mobile UX | P2_PRODUCT_ISSUE | https://parselradar.vercel.app/admin/connectors/center | Mobile admin experience should preserve quick scan and actionability | Strict verification-only pass rerun after hardening: authenticated routes opened for analysis-reports/deal-flow/properties/connector-center, no material horizontal overflow observed, and no fake official-proof/valuation/buy-advice claims detected | PARTIAL_ACCEPTED_FOR_CONTROLLED_BETA | Web UX | P2.PR-PROD-002-STRICT-VIEWPORT-VERIFY | Build PASS. Exact target viewport enforcement (390x844 and 1366x900) remained constrained by integrated browser runtime (actual measured viewport: 490x562), so strict-size completion criteria not met; keep controlled-beta partial status and repeat strict capture in unconstrained session before any public-launch-candidate upgrade. |
| PR-PROD-003 | 2026-05-24 | founder.walkthrough.agent | AGENT | Admin copy/status alignment | P2_PRODUCT_ISSUE | https://parselradar.vercel.app/admin/connectors/center | Scheduler status wording should match currently activated external scheduler posture | Connector Center wording updated to explicit configured/not-yet-verified metadata-only status with manual/blocked source skip clarity | FIXED | Web+Docs | P2.PRODUCT-FIRST-IMPRESSION-3 | Includes: External scheduler configured, first GitHub Actions run not yet verified, metadata-only sync, no property-level official verification, manual/blocked skipped |
| PR-PROD-003A | 2026-05-24 | founder.walkthrough.agent | AGENT | Workflow YAML Diagnostics | P2_PRODUCT_ISSUE | https://github.com/AyhanEkici/parselradar/actions/workflows/scheduled-metadata-sync.yml | Workflow should be YAML-parse clean in editor and CI linting | Replaced fragile heredoc Python block with YAML-safe inline validator in run block; local YAML parser now passes | FIXED | Platform+Docs | P2.PRODUCT-FIRST-IMPRESSION-3 | Diagnostics addressed; first successful GitHub Actions scheduled run still requires explicit verification |
| PR-PROD-004 | 2026-05-24 | founder.walkthrough.agent | AGENT | Report evidence metadata completeness | P2_PRODUCT_ISSUE | https://parselradar.vercel.app/properties/6a09317e90f79b455480b80e/result | Evidence matrix and review/source fields should reflect concrete metadata state for user trust and readiness decisions | Added API-level evidence metadata contract on document payloads and wired frontend matrix/doc cards to consume source/review/manual-action completeness fields with safer pending wording | PARTIAL_BACKEND_HARDENED_FOR_CONTROLLED_BETA | Web+Product+API | P2.PRODUCT-HARDENING-PR-PROD-004 | Backend/API contract + frontend mapping hardened for controlled beta. Deferred: deeper historical backfill and broader route/runtime validation before public launch. |
| PR-PROD-005 | 2026-05-25 | external.viewer.real | EXTERNAL_VIEWER | Conversational workflow | P1_FLOW_BLOCKER | https://parselradar.vercel.app/properties/new | User should be able to reach analysis intent through a guided conversation-first flow | Authenticated flow test passed: dashboard composer + structured fields + missing guidance + safe prefill transition to Yeni Mülk verified | USER_FLOW_TEST_PASS | Product+Web UX | P2.CONVERSATIONAL-ANALYSIS-WORKFLOW-MVP-2 | Verified without backend/API changes; no official-verification or valuation/buy-advice claim introduced. |
| PR-PROD-006 | 2026-05-25 | external.viewer.real | EXTERNAL_VIEWER | Navigation clarity | P2_PRODUCT_ISSUE | https://parselradar.vercel.app/properties/new | User should clearly understand whether tabs are required and what Yeni Mulk fills automatically | Main path copy is clear across App shell, Yeni Mülk, and property detail/report flow; support-page expectation is understandable | USER_FLOW_TEST_PASS | Product+Web UX | P2.CONVERSATIONAL-ANALYSIS-WORKFLOW-MVP-2 | Minor copy polish applied for readability (TR diacritics) after authenticated test. |
| PR-PROD-007 | 2026-05-25 | external.viewer.real | EXTERNAL_VIEWER | Upload/OCR flow expectation | P2_PRODUCT_ISSUE | https://parselradar.vercel.app/properties/6a09317e90f79b455480b80e/documents | User should see a clear upload-to-output journey and understand OCR/storage behavior | Viewer explicitly wants upload path visibility for OCR, storage, and output flow; runtime OCR is not active | PLANNED_AFTER_SPEC | Product+Web UX+Docs | P2.CONTROLLED-BETA-FEEDBACK-INGESTION-REAL-1 | Keep OCR implementation deferred and trust-safe wording explicit until approved scope. |
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

## P2.SYNTHETIC-QA-1 - Agent-Driven Synthetic Beta QA

Use this section for synthetic QA findings generated by agent-driven runtime verification. Do not label these as human tester feedback.

| ID | Date | Reporter | Role | Area | Severity | URL | Expected | Actual | Status | Owner | Fix phase | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PR-SYNTH-001 | 2026-05-23 | qa.agent.synthetic | AGENT | Auth/Login Copy | P3_POLISH | https://parselradar.vercel.app/login | Turkish login helper copy should be locale-consistent | "Wachtwoord vergeten?" appears on Turkish login surface | FIXED | Web UX | P2.SYNTHETIC-QA-1B | Login helper text standardized to Turkish on login page (`Sifremi unuttum`) |
| PR-SYNTH-002 | 2026-05-23 | qa.agent.synthetic | AGENT | Runtime Navigation | P3_POLISH | https://parselradar.vercel.app/admin/deal-flow | Route transitions should avoid noisy failed-resource events during normal navigation | Intermittent `requestFailed net::ERR_ABORTED` events observed while target pages still render | ACCEPTED | Web+API | P2.SYNTHETIC-QA-1B | Accepted as non-functional transition noise while pages render; continue monitoring |
| PR-SYNTH-003 | 2026-05-23 | qa.agent.synthetic | AGENT | Routing/UX | P3_POLISH | https://parselradar.vercel.app/does-not-exist | Unknown route should present explicit not-found UX decision | Unknown logged-out route currently redirects to login guard path | ACCEPTED | Web UX | P2.SYNTHETIC-QA-1B | Guard-first redirect intentionally retained during controlled beta to avoid auth guard risk |
