# CONNECTOR SYNC FOUNDATION

## Scope
This document finalizes the legal-safe connector sync foundation for controlled beta operation.

## 1) Source Registry
The connector source registry defines, per connector:
- official source URL
- source status
- legal classification
- service capability labels
- sync safety policy
- manual action requirement
- cron eligibility metadata (strategy only)

Registry intent:
- provide transparent source governance
- avoid hidden/private endpoint assumptions
- block unsafe automation paths

## 2) Connector Catalog
The connector catalog provides service-level visibility for:
- WMS
- WFS
- WMTS
- GetCapabilities
- open data datasets
- metadata-only sources
- blocked sources

Catalog output is administrative metadata for governance and operations.

## 3) Sync Run Engine
Manual admin-triggered "Sync now" is supported.

Behavior:
- allowed only for connectors tagged as SAFE_PUBLIC_METADATA
- blocked for connectors tagged as BLOCKED_NO_AUTOMATION
- records run status and response summary

No cron activation is included in this phase.

## 4) Audit Trail
Each sync run records:
- connector key
- source name and source URL
- trigger mode (manual/scheduled model)
- status (success/failed/blocked/skipped)
- started and finished timestamps
- error reason when present
- response summary payload

Administrative audit events are emitted for sync executions.

## 5) Admin Connector Center
Admin Connector Center surfaces:
- source status
- legal classification
- services
- last sync result
- next sync projection (strategy metadata)
- failure reason
- manual action required
- "Sync now" action with safety guardrails

## 6) Property Report Enrichment Boundaries
Report enrichment policy is explicit:
- uses proven synced metadata and supporting evidence only
- no fake official result claims
- no automated official zoning verification

This policy enrichment is disclosure-oriented and does not add valuation or buy/sell advice claims.

## 7) Cron-Later Strategy
Cron is strategy-only in this phase.

When enabled in a future phase, it must be limited to:
- SAFE_PUBLIC_METADATA connectors
- public GetCapabilities endpoints
- public open datasets

Cron must remain disabled for blocked/permissioned/private connectors.

## 8) Legal and Safety Boundaries
Hard boundaries remain:
- no scraping
- no CAPTCHA/login bypass
- no e-Devlet bypass
- no hidden/private endpoint harvesting
- no secret exposure
- no .env mutation from this implementation

## 9) TKGM Boundary (Manual-Only)
TKGM remains manual-only for user/admin evidence workflows.

Explicitly disallowed:
- automated TKGM parcel scraping
- automated TKGM result harvesting
- e-Devlet/session bypass automation

## 10) Kayseri e-Imar Boundary (Guidance-Only)
Kayseri municipality source usage remains guidance-only:
- official public source to check manually
- supporting evidence upload after manual check
- no automated municipality zoning verification

### Admin Connector Center Surfacing (P2.CONNECTOR-2B.2)
Verified Kayseri municipality sources are surfaced in Admin Connector Center as connector-center governance entries:
- Kayseri Buyuksehir Kent Rehberi
- Kocasinan Belediyesi e-Imar
- Melikgazi CBS Map
- Talas Uygulama Imar Planlari
- Melikgazi D-Imar (blocked reference)

Connector-center behavior for these entries:
- Manual/public-source guidance connectors are visible with legal mode and access status metadata.
- Manual guidance connectors do not execute automated source sync; sync-now is disabled in UI and policy-skipped in API.
- Blocked source entries remain reference-only with explicit reason: login/CAPTCHA/e-Devlet required.
- No official property-level verification is produced from these entries.

## Launch Status
Public launch readiness remains NOT_READY.
Controlled beta continues with legal-safe, metadata-first connector operation.
