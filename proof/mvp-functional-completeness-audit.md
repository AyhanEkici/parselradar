# MVP Functional Completeness Audit

Generated at: 2026-05-21T20:46:18.359Z
Baseline commit: 38355679
MVP completeness score: 49

## Production blockers
- none

## Partial pages
- none

## Placeholder/mock areas
- none

## Broken actions
- none

## Missing APIs
- POST /admin/deal-pool/:propertyId/accept: No frontend consumer found for this protected API endpoint.
- POST /admin/deal-pool/:entryId/share: No frontend consumer found for this protected API endpoint.
- GET /admin/security-overview: No frontend consumer found for this protected API endpoint.
- POST /analysis/:propertyId/quick-score: No frontend consumer found for this protected API endpoint.
- POST /analysis/:propertyId/parsel-insight: No frontend consumer found for this protected API endpoint.
- POST /analysis/:propertyId/developer-fit: No frontend consumer found for this protected API endpoint.
- GET /auth/session-diagnostics: No frontend consumer found for this protected API endpoint.
- POST /properties/:propertyId/consent: No frontend consumer found for this protected API endpoint.
- GET /credits/: No frontend consumer found for this protected API endpoint.
- POST /credits/dev-add: No frontend consumer found for this protected API endpoint.
- POST /properties/:propertyId/documents: No frontend consumer found for this protected API endpoint.
- GET /properties/:propertyId/documents: No frontend consumer found for this protected API endpoint.
- GET /properties/:propertyId/documents/:documentId/view: No frontend consumer found for this protected API endpoint.
- GET /properties/:propertyId/documents/:documentId/download: No frontend consumer found for this protected API endpoint.
- DELETE /properties/:propertyId/documents/:documentId: No frontend consumer found for this protected API endpoint.
- POST /exports/analysis/:propertyId: No frontend consumer found for this protected API endpoint.
- GET /investor/dashboard: No frontend consumer found for this protected API endpoint.
- GET /investor/saved-analyses: No frontend consumer found for this protected API endpoint.
- POST /investor/saved-analyses: No frontend consumer found for this protected API endpoint.
- DELETE /investor/saved-analyses/:id: No frontend consumer found for this protected API endpoint.
- GET /investor/watchlist: No frontend consumer found for this protected API endpoint.
- POST /investor/watchlist: No frontend consumer found for this protected API endpoint.
- DELETE /investor/watchlist/:id: No frontend consumer found for this protected API endpoint.
- GET /notifications: No frontend consumer found for this protected API endpoint.
- GET /notifications/preferences: No frontend consumer found for this protected API endpoint.
- PATCH /notifications/preferences: No frontend consumer found for this protected API endpoint.
- POST /notifications/:id/read: No frontend consumer found for this protected API endpoint.
- POST /notifications/:id/archive: No frontend consumer found for this protected API endpoint.
- GET /notifications/digests: No frontend consumer found for this protected API endpoint.
- POST /notifications/test-event: No frontend consumer found for this protected API endpoint.

## Top 10 next fixes
1. none

Recommended next phase: P2.2 — MVP Blocker Closure (no connector/TUCBS implementation)
