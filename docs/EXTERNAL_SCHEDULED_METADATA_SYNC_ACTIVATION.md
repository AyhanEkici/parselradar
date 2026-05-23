# EXTERNAL SCHEDULED METADATA SYNC ACTIVATION

Activation date: 2026-05-24

## Scheduler Platform
- GitHub Actions scheduled workflow

## Target Endpoint
- `https://parselradar-production.up.railway.app/admin/connectors/sync/scheduled`

## Secret Header
- `x-connector-sync-secret`

## Cadence
- Daily at 03:15 UTC

## Eligibility Policy
- Only `PUBLIC_METADATA_SYNC` sources are eligible.
- Manual-guidance sources are skipped.
- Blocked, login, CAPTCHA, and e-Devlet sources are skipped.
- TKGM parcel automation remains forbidden.
- e-İmar property verification remains forbidden.

## Audit and Logging
- Every run is recorded as a scheduled connector sync execution.
- Admin audit events should continue to record the scheduled sync summary.
- Responses and logs must remain metadata-only and must not expose secrets or tokens.

## Rollback Procedure
1. Disable or remove the GitHub Actions scheduled workflow.
2. Remove the matching GitHub Actions secret if rollout must be fully stopped.
3. Revert this activation commit if the scheduler must be removed from repo history.
4. Keep the backend trigger security in place even if the external scheduler is rolled back.

## Status
- Public launch remains `NOT_READY`.
- Controlled beta remains `READY_FOR_CONTROLLED_BETA_CONTINUATION`.