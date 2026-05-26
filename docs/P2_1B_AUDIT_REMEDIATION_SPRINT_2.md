# P2.1B - Audit Remediation Sprint 2

## Goal

Reduce the next wave of medium audit findings after P2.1A without changing product scope.

## Target files

- apps/web/src/pages/PropertyResult.tsx
- apps/web/src/pages/AdminPropertyDocuments.tsx
- apps/web/src/pages/ResetPassword.tsx
- apps/web/src/pages/Login.tsx
- apps/web/src/pages/ForgotPassword.tsx
- apps/api/scripts/geodata/p2Geo10VerifyAdminDiagnosticSurface.ts
- apps/api/scripts/geodata/p2Geo2TestKayseriSignals.ts
- apps/api/scripts/verifyEmailProviderReadiness.ts
- apps/api/scripts/verifyPilotEnv.ts

## Method

P2.1B does not delete functionality. It converts generic TODO/FIXME/HACK/placeholder-style markers into explicit P2_1B_TRIAGED_BACKLOG markers so the backlog is intentionally classified rather than hidden as unresolved generic implementation debt.

## Guardrails

- no connector activation
- no scraping
- no full Turkey import
- no production swap
- no fake OCR
- no official verification claim
- commit only after all gates pass