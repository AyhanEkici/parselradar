# OCR PREVIEW POC PLAN

## 1) Purpose
Define a safe, non-runtime OCR preview proof-of-concept (POC) plan for later phases in ParselRadar.

## 2) Why OCR Could Help ParselRadar
OCR could help convert manually uploaded screenshot/document text into structured hints that support evidence review workflows.
Potential benefits:
- faster metadata prefill for evidence cards
- easier identification of visible location fields
- reduced manual copy/paste effort
- improved review queue prioritization through confidence flags

## 3) Controlled-Beta Boundary
- OCR is not active in the product in this phase.
- No runtime OCR implementation is included.
- No real user files are processed in this phase.
- Controlled beta remains unchanged and trust-first.

## 4) What OCR Is Allowed To Do Later
Allowed future behavior (only after explicit approval):
- extract visible text from user-uploaded screenshots/documents
- suggest candidate structured fields
- attach confidence and manual-review flags
- provide guidance-only hints for evidence completeness

## 5) What OCR Must Never Claim
OCR output must never claim:
- official verification
- official valuation
- legal certainty
- automated TKGM/e-İmar/e-Devlet validation
- buy/sell recommendation

## 6) Candidate Document Types
- property ad screenshots
- parcel screenshots
- e-İmar screenshots
- municipal plan screenshots
- manual evidence uploads

## 7) Candidate Extracted Fields
- province
- district
- neighborhood
- ada/parsel if visible
- source label
- document date if visible
- visible zoning text if present
- warning text / limitations

## 8) Trust-Safe Output Model
Proposed non-authoritative output payload:
- `extractedText`
- `extractedFields`
- `confidence`
- `requiresManualReview`
- `sourceScreenshotRequired`
- `guidanceOnly`
- `notOfficialVerification`

Safety defaults:
- `requiresManualReview=true`
- `guidanceOnly=true`
- `notOfficialVerification=true`

## 9) POC Architecture Options
### Option A: Local OCR (offline/dev only)
- Run OCR locally in development-only experiments.
- No production integration.
- No user data processing.

### Option B: Server-side worker later
- Future internal worker for asynchronous extraction.
- Requires strict queue isolation, audit trails, and review gating.

### Option C: External OCR provider later
- Consider only after legal/security review.
- Must keep clear data residency and retention controls.

### Option D: Manual review assisted OCR
- OCR generates draft suggestions only.
- Human reviewer confirms or rejects every extracted field.

## 10) Risks
- OCR hallucination
- wrong parcel extraction
- Turkish character errors
- low-quality screenshots
- official-source overclaim risk

## 11) Required Manual Review Gate
No OCR-derived field should enter user-facing report logic without manual confirmation.
Review gate requirements:
1. reviewer identity recorded
2. accepted/rejected field-level decision stored
3. source screenshot reference preserved
4. confidence reviewed before acceptance

## 12) No-Public-Launch Claim
This POC plan does not activate OCR and does not change launch readiness.
Public launch remains NOT_READY.

## 13) Acceptance Criteria Before Implementation
Implementation may start only when all are true:
1. trust policy approved
2. explicit no-overclaim wording approved
3. manual review workflow designed and testable
4. audit trail schema defined
5. synthetic-only test corpus prepared (no real user docs)
6. legal/compliance review completed for chosen architecture

## 14) Recommended First POC Scope
Smallest safe scope:
- synthetic screenshot set only
- extract only province/district/neighborhood + document date if visible
- confidence + manual-review flags mandatory
- zero write-back to live reports
- no external paid OCR dependency

## 15) Final Recommendation
- Proceed with documentation-first preparation only.
- Keep implementation deferred.
- Start later with a tiny synthetic-data prototype under strict review gating.
- Maintain explicit guidance-only and not-official-verification boundaries at all times.
