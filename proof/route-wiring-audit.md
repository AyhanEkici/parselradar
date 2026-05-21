# ROUTE WIRING AUDIT

Overall status: FAIL

Failing routes (classification: STALE_STATE):
- /admin/audit-timeline
- /admin/users
- /admin/analyses
- /admin/credit-ledger
- /admin/stripe-sessions
- /admin/properties
- /admin/runtime
- /admin/deployment
- /admin/observability
- /admin/analytics
- /admin/connectors
- /investor
- /investor/saved-analyses
- /investor/watchlist
- /investor/portfolio
- /organizations
- /notifications

Observed defect pattern:
- authenticated navbar/app shell does not persist after login flow collapse
- admin routes redirect to /login because session state is missing
- investor/org/notification pages can render without authenticated shell context
