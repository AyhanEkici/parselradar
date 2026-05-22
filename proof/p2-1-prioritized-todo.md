# P2.1 Prioritized TODO (Updated by P2.1A-FIX)

- generatedAt: 2026-05-22T01:45:00.000Z
- mvpCompletenessScore: 93

## Resolved P0/P1
- [P0] /credits checkout contract mismatch: resolved (audit false-positive fixed)
- [P1] /stripe/* group: reconciled
- [P1] /documents/* group: reconciled
- [P1] /admin/ogc/* group: reconciled to diagnostics route, remains NOT_CONFIGURED
- [P1] /admin/tucbs/* group: reconciled to diagnostics route, remains NOT_CONFIGURED
- [P1] /admin/property-documents route gap: resolved as route naming false-positive

## Remaining
- [P2] /analyses route wiring missing
- [P2] /properties route wiring missing
- [P2] POST /admin/deal-pool/:propertyId/accept no frontend consumer
- [P2] POST /admin/deal-pool/:entryId/share no frontend consumer
- [P2] GET /admin/security-overview no frontend consumer
- [P2] POST /analysis/:propertyId/parsel-insight no frontend consumer
- [P2] POST /analysis/:propertyId/developer-fit no frontend consumer
- [P2] GET /auth/session-diagnostics no frontend consumer
- [P2] GET /admin/telemetry no frontend consumer

## Next Phase Recommendation
- P2.1A-FIX-2 — continue remaining P1/P2 wiring blockers with scope control
