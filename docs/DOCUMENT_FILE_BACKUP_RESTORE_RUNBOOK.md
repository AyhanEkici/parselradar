# DOCUMENT FILE BACKUP RESTORE RUNBOOK

## Scope
Covers uploaded documents/evidence files used by the application.

## Storage Model
- Primary evidence storage: application file/object storage
- Backup storage: encrypted backup vault with versioning
- Access: restricted to authorized operational roles

## Ownership
- File backup owner role: Platform Operations Lead
- File restore owner role: Incident Commander + Storage Operator

## Backup Frequency
- Production: daily full backup + hourly incremental snapshot where supported
- Staging: daily backup
- Local/dev/test: non-production only, no production evidence data

## Retention
- Production file backups: minimum 90 days
- Staging file backups: minimum 30 days
- Deleted-file recovery window: minimum 14 days where provider supports soft-delete/versioning

## Restore Path
1. Identify affected property/document IDs and time window.
2. Locate backup object versions/snapshots.
3. Restore to isolated location first.
4. Validate checksum/hash and metadata consistency.
5. Rebind restored files to application references after approval.
6. Record restore evidence and operator sign-off.

## Restore Drill Requirements
- Cadence: quarterly with representative evidence sample
- Must verify:
  - file retrievability
  - metadata linkage
  - access control consistency

## Integrity Expectations
- Restored file checksums must match backup records
- Metadata and ownership links must remain consistent
- Restored documents must respect original access constraints

## Admin Deletion Audit Expectations
- Every admin deletion action should have audit event traceability
- Deletion reason and actor identity must be logged

## Sensitive Data Controls
- No credential/session/token storage in evidence files by policy
- No default persistence of T.C. Kimlik/e-Devlet sensitive data fields unless explicitly approved and legally governed
- Redaction and minimization required for sensitive uploads where feasible

## User-Requested Deletion Handling
- Validate requester identity and ownership context
- Apply retention/legal hold rules before deletion
- Log deletion request, decision, and execution outcome

## Supporting Evidence Disclaimer
User-provided official-source artifacts remain supporting evidence only unless validated through approved verification channels.
