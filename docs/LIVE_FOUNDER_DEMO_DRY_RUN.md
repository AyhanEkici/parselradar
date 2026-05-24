# LIVE FOUNDER DEMO DRY RUN

## 1) Phase Metadata
- Phase: P2.CONTROLLED-BETA-DEMO-REHEARSAL-1
- Date: 2026-05-24
- Environment: live deployed web and API
- Mode: founder-led rehearsal, no feature-building
- Guardrails respected: no backend/API/auth/payment/connector/cron/workflow behavior changes

## 2) Current Baseline
- Latest commit at start: d168b071
- Demo script and one-pager available
- Previous decision: SHOW NOW WITH LIMITS
- Trust/honesty audit baseline: PASS
- P0/P1 demo blockers: none
- PR-PROD-001: FIXED
- PR-PROD-002: PARTIAL_ACCEPTED_FOR_CONTROLLED_BETA
- PR-PROD-003: FIXED
- PR-PROD-004: PARTIAL_ACCEPTED_FOR_CONTROLLED_BETA
- First GitHub Actions successful run: not yet verified
- Public launch: NOT_READY

## 3) Route Sequence Tested
1. /
2. /login
3. /dashboard
4. /properties/new
5. /properties/6a09317e90f79b455480b80e
6. /properties/6a09317e90f79b455480b80e/documents
7. /properties/6a09317e90f79b455480b80e/result
8. /properties/6a09317e90f79b455480b80e/report
9. /admin/connectors/center
10. /credits
11. /map

## 4) Rehearsal Score Table
### Route-by-Route Rehearsal Checks
| Route | Opens | Demo narrative clear | Visual impression | User understands next step | Founder explanation needed | Trust risk | Overclaim risk | Rehearsal note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | yes (redirects to /dashboard in authenticated session) | partial | acceptable | partial | yes | no | no | Strong when shown logged-out; authenticated redirect must be explained at start. |
| /login | yes (redirects to /dashboard in authenticated session) | partial | acceptable | partial | yes | no | no | Explain this route as controlled-beta gate; active session can skip form UI. |
| /dashboard | yes | yes | acceptable | yes | no | no | no | Clear CTA anchors for founder flow. |
| /properties/new | yes | yes | acceptable | yes | no | no | no | Stepwise flow supports concise intake narration. |
| /properties/6a09317e90f79b455480b80e | yes | partial | acceptable | partial | yes | no | no | Dense analytics panel needs guided narration and disclaimer highlight. |
| /properties/6a09317e90f79b455480b80e/documents | yes | yes | acceptable | yes | no | no | no | Manual evidence and boundary wording is clear and trust-safe. |
| /properties/6a09317e90f79b455480b80e/result | yes | yes | acceptable | yes | yes | no | no | Strong page but founder should explain guidance-only readiness language. |
| /properties/6a09317e90f79b455480b80e/report | yes | yes | acceptable | yes | no | no | no | Route alias works and supports demo continuity. |
| /admin/connectors/center | yes | yes | acceptable | partial | yes | no | no | Governance and limits are clear; dense view benefits from scripted framing. |
| /credits | yes | yes | acceptable | yes | no | no | no | Commercial utility and trust boundary coexist well. |
| /map | yes | partial | acceptable | partial | yes | no | no | Preview-only and diagnostics need explicit expectation setting. |

### Rehearsal Scoring (0-100)
| Area | Score |
| --- | --- |
| Homepage pitch | 82 |
| Intake explanation | 87 |
| Evidence/documents explanation | 89 |
| Report explanation | 86 |
| Connector/source guidance explanation | 88 |
| Credit/map explanation | 81 |
| Overall demo smoothness | 85 |
| Viewer confidence | 84 |
| Founder confidence | 87 |

## 5) What Worked Smoothly
- Dashboard -> intake -> documents -> result progression is coherent and reproducible.
- Evidence matrix and missing-evidence actions are straightforward for narration.
- /report alias behaves consistently with /result.
- Connector center communicates legal/safety boundaries clearly.
- Credits page maintains trust-safe commercial framing.

## 6) Where Founder Narration Is Required
- Explain authenticated redirects on / and /login in rehearsal sessions.
- Frame property detail screen as rich context, not official conclusion.
- Clarify result readiness as guidance-only, not official verification.
- Emphasize connector center as governance transparency, not automation depth.
- Set expectations for map preview diagnostics and current provider availability.

## 7) Demo Risks
- P0: none.
- P1: none.
- P2: must verbally frame controlled-beta boundaries and manual official checks during demo.
- P3: mobile admin scanability remains partial on dense surfaces.
- P3: report metadata completeness remains partial and should be described as in-progress hardening.

## 8) Trust/Honesty Audit
Result: PASS

Verified absent in rehearsal surfaces:
- official proof generated claim
- official valuation claim
- automated TKGM result claim
- automated e-Imar zoning result claim
- guaranteed opportunity claim
- buy/sell advice
- public-launch-ready claim
- OCR runtime claim as active capability
- fully automated government data claim

## 9) Verbal Framing Checklist
- Controlled beta, not public launch: confirmed.
- Guidance only, not official verification: confirmed.
- Official checks remain manual unless permissioned integrations are approved: confirmed.
- TKGM/e-Imar are not automated: confirmed.
- Manual evidence is still needed: confirmed.
- Some metadata completeness is still being hardened: confirmed.
- Mobile admin is acceptable for controlled beta but not final: confirmed.
- First GitHub Actions successful run is still not verified: confirmed.

## 10) Recommended 10-Minute Demo Script Adjustments
1. Start with a one-line note about authenticated redirect behavior for / and /login.
2. Keep property detail segment time-boxed to avoid over-focusing on dense analytics.
3. Add one explicit sentence before result page: readiness is guidance-only.
4. Use connector center as a 45-second governance proof point, not a deep operational tour.

## 11) Recommended 20-Minute Demo Script Adjustments
1. Add a short branch: show logged-out homepage once, then continue with authenticated flow.
2. In property detail, narrate only high-signal widgets and disclaimer block.
3. In result/report, compare one present and one missing evidence row to teach the model quickly.
4. In connector center, call out metadata-only + manual/blocked policy and move on.
5. End with map as transparency proof (preview + diagnostics), not capability promise.

## 12) Viewer Questions To Ask
- Which screen most increased your confidence in review discipline?
- Which explanation still felt ambiguous or too technical?
- Which missing-evidence action would you expect to take first in real use?
- Did any wording sound like an overclaim?
- What would you need to see before expanding beyond controlled beta?

## 13) Final Decision
- SHOW WITH LIMITS

## 14) Public Launch Status
- NOT_READY

## 15) Controlled Beta Status
- READY_FOR_CONTROLLED_BETA_CONTINUATION

## 16) Next TODOs
1. Verify first successful GitHub Actions scheduled run and add proof record.
2. Continue mobile admin scanability improvements for dense admin surfaces.
3. Continue metadata completeness hardening in report/source fields.
4. Keep trust-copy and do-not-say checks in each rehearsal and polish loop.
