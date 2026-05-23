# SAFE SCHEDULED METADATA SYNC CRON PLAN

## Scope
Define and implement a legal-safe scheduled metadata sync trigger that is limited to allowed connector sources and does not produce property-level verification.

## Endpoint
- `POST /admin/connectors/sync/scheduled`
- Protection: existing `auth` + `admin` middleware.
- Trigger type recorded as `SCHEDULED` in sync runs.

## Allowed Sources
A source is eligible only when all rules pass:
- `legalMode === PUBLIC_METADATA_SYNC`
- `cronEligible === true`
- `activationState === ACTIVE`
- `syncSafety === SAFE_PUBLIC_METADATA`
- `manualActionRequired === false`
- access status is public and not blocked/permissioned/login/CAPTCHA/e-Devlet.

## Skipped Sources
Scheduled sync must skip and log skip reasons for:
- `MANUAL_GUIDANCE`
- `BLOCKED`
- non-cron-eligible sources
- non-public metadata legal mode
- inactive connectors
- blocked/login/CAPTCHA/e-Devlet/permissioned access statuses.

Expected skipped examples in current registry:
- `tkgm_parcel`
- `municipality_zoning`
- `kayseri_kent_rehberi`
- `kocasinan_eimar`
- `melikgazi_cbs_map`
- `talas_imar_planlari`
- `melikgazi_dimar_blocked`

## Metadata-Only Boundary
- Scheduled sync can execute metadata/catalog/capabilities sync only.
- No property-level official verification output.
- No valuation, buy advice, or official-proof generation.

## Audit Trail
- Every scheduled decision is logged as a `ConnectorSyncRun` (`SUCCESS`, `FAILED`, or `SKIPPED`).
- Admin audit event `connector_scheduled_sync_run` records endpoint execution summary.

## Failure Handling
- Failed eligible runs are counted in response summary.
- Policy skips are counted and include explicit reason tags.
- Endpoint response includes:
  - `totalSources`
  - `eligible`
  - `skipped`
  - `passed`
  - `failed`
  - `noPropertyLevelVerification: true`

## External Scheduler Activation (Later)
Implementation does not activate external cron by itself.
- Vercel/Railway scheduler wiring is a separate deployment step.
- Until configured, scheduled sync remains manually triggerable via protected endpoint only.

## Launch Posture
- Public launch remains `NOT_READY`.
- Controlled beta can continue with metadata-only scheduled sync guardrails.
