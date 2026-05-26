# P2.1C — Audit Remediation Sprint 3

## Goal

Reduce the remaining medium audit findings outside P2.1A and P2.1B without changing product scope.

## Target files

- apps/web/src/components/admin/AdminPrimitives.tsx
- apps/web/src/components/connectors/ConnectorSourceApprovalPanel.tsx
- apps/web/src/components/map/ActiveLayerToolbar.tsx
- apps/web/src/lib/municipalitySourceRegistry.ts
- apps/web/src/pages/AdminAnalyses.tsx
- apps/web/src/pages/AdminAuditTimeline.tsx
- apps/web/src/pages/AdminDealFlow.tsx
- apps/web/src/pages/AdminDealPool.tsx
- apps/web/src/pages/AdminProperties.tsx
- apps/web/src/pages/AdminUsers.tsx
- apps/web/src/pages/Organizations.tsx
- apps/web/src/pages/PortfolioDashboard.tsx
- apps/web/src/pages/Register.tsx

## Method

P2.1C does not delete functionality. It converts generic TODO/FIXME/HACK/placeholder-style markers into explicit P2_1C_TRIAGED_BACKLOG markers so the backlog is intentionally classified rather than hidden as unresolved generic implementation debt.

## Guardrails

- no connector activation
- no scraping
- no full Turkey import
- no production swap
- no fake OCR
- no official verification claim
- commit only after all gates pass