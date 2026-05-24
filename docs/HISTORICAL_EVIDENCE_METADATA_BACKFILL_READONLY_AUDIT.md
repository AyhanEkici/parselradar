# Historical Evidence Metadata Backfill Read-Only Audit

## 1) Purpose
Establish a read-only audit plan to identify historical `DocumentUpload` records that may need evidence metadata enrichment after PR-PROD-004 hardening.

## 2) Current PR-PROD-004 evidenceMetadata baseline
Current API responses build an `evidenceMetadata` contract from document fields via `buildEvidenceMetadataContract(...)`, including:
- source label/type/status
- review status
- confidence level
- manual action hint
- official verification status (guidance boundary)
- evidence completeness

## 3) Read-only scope
- No document writes
- No schema migrations
- No runtime behavior changes
- Metadata-only candidate logic and reporting
- No inspection of raw private file content

## 4) Files/models inspected
- `apps/api/src/models/DocumentUpload.ts`
- `apps/api/src/utils/evidenceMetadata.ts`
- `apps/api/src/controllers/documentController.ts`
- `apps/api/src/controllers/propertyController.ts`
- `docs/HISTORICAL_EVIDENCE_METADATA_BACKFILL_PLAN.md`
- `docs/CONTROLLED_BETA_ACTION_BOARD.md`
- `docs/BETA_PILOT_ISSUE_LEDGER.md`

## 5) Candidate record criteria
A historical document is a candidate for potential enrichment review when one or more of these are true:
1. `sourceType` is missing/empty/unknown.
2. `reviewStatus` and `metadataStatus` are missing or inconsistent.
3. `evidenceType` is missing where document classification should exist.
4. `supportingEvidenceOnly` is missing for records expected to carry manual-boundary semantics.
5. Parsed preview metadata indicates manual-review requirement but status fields do not reflect that.

## 6) Backfill risk categories
- LOW: single-field completeness gaps with obvious default mapping.
- MEDIUM: multi-field ambiguity requiring operator decision.
- HIGH: conflicting source/review signals that risk trust overstatement.

## 7) Data that must never be fabricated
Do not fabricate:
- source provenance
- review confirmation state
- official verification state
- confidence assertions unsupported by recorded metadata
- evidence completeness states not inferable from actual fields

## 8) Candidate detection logic
Static logic baseline:
- derive expected metadata contract from existing fields
- compare expected contract preconditions vs available raw fields
- classify records as `NO_ACTION`, `CANDIDATE_LOW`, `CANDIDATE_MEDIUM`, `CANDIDATE_HIGH`
- report counts and anonymized sample IDs only

## 9) Recommended dry-run fields
Read-only projection fields (names only):
- `_id`
- `propertySubmissionId`
- `uploadedAt`
- `documentType`
- `evidenceType`
- `sourceType`
- `reviewStatus`
- `metadataStatus`
- `supportingEvidenceOnly`
- `parsedPreview`
- `csvDetectedFields`

## 10) No-mutation proof requirements
Any future dry-run execution must include proof that:
- operation mode is read-only
- projected write count is zero
- no update/insert/delete commands were executed
- output artifact includes timestamp, operator, and command context

## 11) If DB audit was not run, explain why
No DB audit was run in this phase.
Reason:
- mission constraints prioritize safe read-only planning
- no explicitly approved, pre-existing read-only DB audit path was confirmed in this phase
- static/source audit is the lowest-risk option under current guardrails

## 12) If static audit only, state limitations
Static/source audit limitations:
- cannot produce real candidate counts
- cannot measure true distribution of historical gaps
- cannot validate record-level edge cases in stored data

## 13) Backfill implementation readiness
Current readiness: `NOT_READY_FOR_MUTATION`

Prerequisites still required:
1. explicit approval of read-only DB audit execution
2. dry-run report evidence from real data (read-only)
3. mutation guardrails and rollback package approval

## 14) Required approval before mutation
Required before any write-based backfill:
- product owner approval
- data safety approval
- rollback plan sign-off
- staging dry-run evidence review

## 15) Final recommendation
- Keep implementation deferred.
- Approve a dedicated read-only DB metadata audit first.
- Use candidate thresholds to decide if mutation is justified.
- Preserve trust boundary: guidance-only, not official verification.
