# DATABASE BACKUP RESTORE RUNBOOK

## Purpose
Operational steps for validated backup restore without embedding secrets.

## Roles
- Incident Commander
- DBA/Platform Operator
- API Owner
- Security Observer

## Preconditions
- Active incident/change record
- Approved restore scope and target point
- Production approval documented

## Procedure
1. Confirm incident ID, scope, and restore objective.
2. Confirm backup source ID and timestamp.
3. Provision isolated restore target when possible.
4. Execute restore using provider-native restore workflow.
5. Run schema and integrity checks.
6. Run application smoke checks: health, auth, critical API routes.
7. Compare restored state against expected recovery point.
8. Promote restore target only after approval.

## Validation Checklist
- Health endpoint responds
- Authentication flow operational
- Core read/write endpoints operational
- Audit logging operational
- No unauthorized access drift detected

## Production Guardrails
- Never expose credentials in logs/runbook
- Never run ad-hoc destructive scripts during restore window
- Keep rollback snapshot available until acceptance complete

## Rollback During Restore
- Abort promotion if validation fails
- Re-point traffic to previous known-good environment
- Record failure cause and remediation plan

## Drill Requirements
- Cadence: quarterly
- Evidence artifacts:
  - timings
  - command transcript reference
  - validation checklist result
  - owner sign-off

## Post-Incident Actions
- Capture measured RPO and RTO
- Record lessons learned
- Update policy/runbook if process gaps are found
