# DATABASE BACKUP RPO RTO POLICY

## Scope
This policy covers database backup and restore readiness for local, test, staging, and production environments.

## Ownership
- Backup owner role: Platform Operations Lead
- Backup execution owner: Infrastructure/DBA on duty
- Restore execution owner: Incident Commander + DBA pair
- Approval owner for production restore: Engineering Manager or delegated production approver

## Targets
- RPO target: <= 15 minutes for production transactional data
- RTO target: <= 60 minutes for production service restoration

## Backup Frequency
- Production: continuous snapshots with point-in-time recovery and hourly logical backup export
- Staging: daily snapshot backup
- Local/dev/test: disposable backup optional; no production data allowed

## Retention
- Production snapshots: 35 days minimum
- Production logical backup archives: 90 days minimum
- Staging backups: 14 days minimum
- Local/dev/test backups: best-effort only

## Storage Location Model
- Primary backup location: managed database backup service in primary cloud region
- Secondary backup location: encrypted cross-region backup vault
- Access model: least privilege, break-glass approval for restore operators

## Restore Responsibility
- Incident Commander declares restore event
- DBA executes restore runbook steps
- Application owner validates data and service correctness
- Security reviewer confirms access/audit controls after restoration

## Restore Approval Path
1. Incident declared and severity assigned.
2. Restore request created with rationale and time window.
3. Production approver authorizes restore.
4. DBA executes approved restore scope only.
5. Post-restore verification and sign-off recorded.

## Restore Drill Cadence
- Minimum cadence: quarterly production-like restore drill
- Mandatory participants: Platform Ops, API owner, Security representative
- Drill evidence: command transcript, timing logs, validation checklist, incident ticket/reference

## Minimum Restore Evidence
- Backup source identifier and timestamp
- Restore start/end times
- Measured RPO/RTO values
- Data integrity verification outcome
- Owner sign-off and follow-up actions

## Emergency Restore Steps
1. Freeze write paths if required by incident protocol.
2. Select latest valid recovery point.
3. Restore to isolated target first when feasible.
4. Run integrity checks and smoke tests.
5. Promote restored instance according to change control.
6. Monitor closely for 24h with enhanced alerting.

## Rollback Strategy
- Keep pre-restore snapshot until post-restore acceptance window completes.
- If restore validation fails, revert traffic to last known good instance/snapshot.
- Capture root-cause and corrective action record.

## Environment Distinction
- Local/dev/test must never use production secrets or production datasets.
- Staging and production backup policies are tracked separately.
- Production-only controls apply to production restores.

## Security and Secret Handling
- No secrets are stored in this document.
- Secret material must remain in secure secret managers only.
