# Historical Evidence Metadata Backfill Plan

## 1) Purpose
Define a governance-first, low-risk plan for historical enrichment of document-level evidence metadata without changing runtime behavior in this phase.

## 2) Current evidenceMetadata contract baseline
Current baseline uses a contract-first shape on document payloads with fields such as:
- sourceLabel
- sourceType
- sourceStatus
- reviewStatus
- confidenceLevel
- manualActionRequired
- manualActionHint
- officialVerificationStatus
- guidanceOnly
- lastReviewedAt
- evidenceCompleteness

## 3) Why backfill is deferred
Backfill is deferred to avoid unsafe bulk mutation and accidental over-claiming on historical records. Controlled beta can continue with explicit missing/manual-required labeling.

## 4) Which records may need enrichment
Candidate records include historical documents created before contract rollout where one or more contract fields are absent, null, or inconsistent with stored metadata fields.

## 5) Read-only audit-first approach
First phase is audit-only:
- inventory candidate records
- classify quality gaps
- generate evidence of gaps
- do not mutate records

## 6) Backfill candidate detection rules
A record is a candidate if any condition is true:
- evidenceMetadata object missing
- sourceType missing/unknown where source provenance exists elsewhere
- review status missing or not mappable
- evidenceCompleteness missing
- manualActionRequired/manualActionHint missing

## 7) Dry-run report requirements
Dry-run output must include:
- total documents scanned
- candidates by rule category
- sample anonymized IDs per category
- projected write count by operation type
- zero-write guarantee statement

## 8) No-mutation proof requirements
Before any implementation approval:
- command logs showing read-only execution
- db write counter stays zero
- no changed records checksum proof
- reviewer sign-off on no-mutation evidence

## 9) Proposed future migration/backfill steps
Planned sequence for later phase only:
1. freeze schema contract version
2. run read-only audit and review
3. prepare idempotent migration logic
4. run dry-run in staging snapshot
5. review proof bundle and approvals
6. execute controlled backfill window
7. post-run validation and reconciliation

## 10) Rollback strategy
If future backfill is approved and executed, rollback must include:
- pre-run snapshot/backup reference
- idempotent reversion script or restore path
- incident stop criteria
- post-rollback verification checklist

## 11) Risk classification
- Data integrity risk: medium
- Trust/wording risk: high if fabricated inference is introduced
- Operational risk: medium
- Legal/compliance risk: medium

## 12) Acceptance criteria before implementation
Backfill implementation may proceed only when all are true:
- read-only audit evidence approved
- mutation logic reviewed and idempotent
- staging dry-run validated
- rollback plan tested
- explicit approval recorded

## 13) Why this is not required for controlled beta
Controlled beta requires trust-safe disclosure, not historical perfection. Missing historical fields can remain explicitly marked as missing/manual-required without claiming official verification.

## 14) Public launch impact
Backfill is a public-launch quality enhancer, not a standalone launch unlock. It contributes to metadata consistency thresholds and trust-readiness for broader exposure.

## 15) Final recommendation
- Do not implement backfill now.
- Execute read-only audit first.
- Allow mutation only after proof bundle and explicit approval.
- Never fabricate source/review/evidence metadata.
- Historical records without proof must remain clearly marked as missing/manual required.
