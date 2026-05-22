# P2.1A-FIX API Group Reconciliation

## Result
- /stripe/*: reconciled (audit false-positive fixed via wrapped mount parsing)
- /documents/*: reconciled to existing /properties/:propertyId/documents API surface
- /admin/ogc/*: reconciled to /admin/connectors/ogc diagnostics route; remains NOT_CONFIGURED
- /admin/tucbs/*: reconciled to /admin/connectors/tucbs diagnostics route; remains NOT_CONFIGURED

## Safety Assertions
- connector activation changed: no
- TUCBS activated: no
- OGC activated: no
- hardcoded TUCBS endpoints added: no
- scraping/selenium/captcha tooling added: no
- e-Devlet automation added: no

## Evidence
- audit:mvp-completeness score after fix: 93
- mvp api contract includes:
  - /stripe/create-checkout-session
  - /properties/:propertyId/documents
  - /admin/connectors/ogc
  - /admin/connectors/tucbs
