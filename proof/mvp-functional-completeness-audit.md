# MVP Functional Completeness Audit

Generated at: 2026-05-22T00:55:04.185Z
MVP completeness score: 89%
Scoring basis: 125/141 entities COMPLETE

## Production blockers
- [route] /credits: Core flow blocker: Frontend calls missing API endpoints: stripe/create-checkout-session (P0)

## Partial pages
- none

## Placeholder/mock areas
- none

## Broken actions
- none

## Missing APIs
- POST /admin/deal-pool/:propertyId/accept: No frontend consumer detected for protected endpoint.
- POST /admin/deal-pool/:entryId/share: No frontend consumer detected for protected endpoint.
- GET /admin/security-overview: No frontend consumer detected for protected endpoint.
- POST /analysis/:propertyId/parsel-insight: No frontend consumer detected for protected endpoint.
- POST /analysis/:propertyId/developer-fit: No frontend consumer detected for protected endpoint.
- GET /auth/session-diagnostics: No frontend consumer detected for protected endpoint.
- GET /admin/telemetry: No frontend consumer detected for protected endpoint.
- POST /create-checkout-session: No frontend consumer detected for protected endpoint.
- ANY /stripe/*: Expected API group missing from route map: /stripe
- ANY /documents/*: Expected API group missing from route map: /documents
- ANY /admin/ogc/*: Expected API group missing from route map: /admin/ogc
- ANY /admin/tucbs/*: Expected API group missing from route map: /admin/tucbs

## Top 10 next fixes
1. /credits - PRODUCTION_BLOCKER - Core flow blocker: Frontend calls missing API endpoints: stripe/create-checkout-session (P0)
2. /analyses - DISCONNECTED - Route is missing from App route wiring. (P2)
3. /properties - DISCONNECTED - Route is missing from App route wiring. (P2)
4. /admin/property-documents - DISCONNECTED - Route is missing from App route wiring. (P2)
