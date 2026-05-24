# Historical Evidence Metadata Backfill Dry-Run Script Spec

## Proposed script name
- `apps/api/scripts/auditHistoricalEvidenceMetadataReadOnly.ts`

## Input env requirements (names only)
- `MONGODB_URI`
- `NODE_ENV`
- optional execution guard flag: `BACKFILL_AUDIT_READONLY=true`

No secret values are printed.

## Read-only query shape
Collection target:
- `DocumentUpload`

Projection-only read:
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

Filters (report buckets only):
- missing source/review/evidence markers
- conflicting review/metadata status combinations
- manual-review indicator gaps

## Output fields
- audit timestamp
- total scanned record count
- candidate counts by rule
- severity grouping (`LOW`, `MEDIUM`, `HIGH`)
- anonymized sample IDs per rule (capped)
- explicit `writeCount: 0`
- guardrail statement: `READ_ONLY_NO_MUTATION`

## No-write guard
Mandatory controls:
1. no `update`, `insert`, `delete`, `bulkWrite`, or migration entry points
2. no model `save()` calls
3. process exits with failure if write mode flag is requested
4. script emits read-only guard status before running queries

## Safe failure modes
On unsafe conditions, stop with non-zero exit code:
- missing required env name(s)
- guard flag absent/invalid
- DB connection failure
- detected attempt to access write paths

Failure output must remain non-secret and metadata-only.

## Proof bundle requirements
Dry-run evidence bundle should include:
- command used
- timestamp and operator
- script version/hash
- read-only guard output
- summary counts and anonymized samples
- `writeCount: 0` confirmation

## Scope note
This is a specification document only.
No executable backfill script is implemented in this phase.
