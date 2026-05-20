# MVP Wiring Audit

- generatedAt: 2026-05-20T22:01:05.008Z
- overallStatus: PASS
- total: 44, pass: 41, warn: 3, fail: 0

| navLabel | route | component | requiredRole | backendEndpoints | adminExpected | userExpected | authHeaderRequired | currentStatus | issue | fixRequired |
|---|---|---|---|---|---|---|---|---|---|---|
| - | / | Navigate | AUTHENTICATED | - | YES | YES | YES | WARN | No explicit apiFetch endpoint detected in component (might be static or child-driven). | Confirm child components or hooks handle API calls safely. |
| - | /login | Login | PUBLIC | - | NO | YES | NO | PASS | None | None |
| - | /forgot-password | ForgotPassword | PUBLIC | - | NO | YES | NO | PASS | None | None |
| - | /reset-password | ResetPassword | PUBLIC | - | NO | YES | NO | PASS | None | None |
| - | /register | Register | PUBLIC | - | NO | YES | NO | PASS | None | None |
| - | /access-denied | AccessDenied | PUBLIC | - | NO | YES | NO | PASS | None | None |
| - | /dashboard | Dashboard | AUTHENTICATED | credits | YES | YES | YES | PASS | None | None |
| - | /credits | Credits | AUTHENTICATED | credits, credits/dev-add, stripe/create-checkout-session | YES | YES | YES | PASS | None | None |
| - | /reports | Reports | AUTHENTICATED | reports | YES | YES | YES | PASS | None | None |
| Properties | /admin/properties | AdminProperties | ADMIN | admin/properties | YES | NO | YES | PASS | None | None |
| - | /admin/properties/:propertyId | PropertyDetail | ADMIN | admin/properties/${resolvedId}/status, analysis/${resolvedId}/quick-score?force=1, exports/analysis/${resolvedId}, investor/portfolio/${portfolioId}/items, investor/saved-analyses, investor/watchlist, workspace/${organizationId}/portfolios, workspace/${organizationId}/shared-analysis, workspace/${organizationId}/watchlist | YES | NO | YES | PASS | None | None |
| - | /admin/properties/:propertyId/documents | AdminPropertyDocuments | ADMIN | admin/properties/${propertyId}, properties/${propertyId}/documents/${documentId} | YES | NO | YES | PASS | None | None |
| - | /admin/deal-pool | AdminDealPool | ADMIN | - | YES | NO | YES | WARN | No explicit apiFetch endpoint detected in component (might be static or child-driven). | Confirm child components or hooks handle API calls safely. |
| Audit | /admin/audit-timeline | AdminAuditTimeline | ADMIN | /admin/audit-events?${params.toString()} | YES | NO | YES | PASS | None | None |
| Users | /admin/users | AdminUsers | ADMIN | /admin/email-delivery-state, /admin/users/${targetUserId}/role, /admin/users?${params.toString()} | YES | NO | YES | PASS | None | None |
| Analyses | /admin/analyses | AdminAnalyses | ADMIN | /admin/analyses?${params.toString()} | YES | NO | YES | PASS | None | None |
| Credit Ledger | /admin/credit-ledger | AdminCreditLedger | ADMIN | /admin/credit-ledger?${params.toString()} | YES | NO | YES | PASS | None | None |
| Stripe Sessions | /admin/stripe-sessions | AdminStripeSessions | ADMIN | /admin/stripe-sessions?${params.toString()} | YES | NO | YES | PASS | None | None |
| Runtime | /admin/runtime | AdminSystemRuntime | ADMIN | /admin/runtime | YES | NO | YES | PASS | None | None |
| Deployment | /admin/deployment | AdminDeploymentOverview | ADMIN | /admin/deployment | YES | NO | YES | PASS | None | None |
| Observability | /admin/observability | AdminObservability | ADMIN | /admin/analyses?page=1, /admin/observability | YES | NO | YES | PASS | None | None |
| Analytics | /admin/analytics | AdminAnalytics | ADMIN | /admin/analytics | YES | NO | YES | PASS | None | None |
| Connectors | /admin/connectors | AdminConnectors | ADMIN | /admin/connectors, /admin/connectors/audit-trail | YES | NO | YES | PASS | None | None |
| - | /admin/connectors/:connectorKey | AdminConnectorDetail | ADMIN | /admin/connectors/${connectorKey}, /admin/connectors/${connectorKey}/activation-plan | YES | NO | YES | PASS | None | None |
| - | /properties/new | NewProperty | AUTHENTICATED | properties | YES | YES | YES | PASS | None | None |
| - | /properties/:id | PropertyDetail | AUTHENTICATED | admin/properties/${resolvedId}/status, analysis/${resolvedId}/quick-score?force=1, exports/analysis/${resolvedId}, investor/portfolio/${portfolioId}/items, investor/saved-analyses, investor/watchlist, workspace/${organizationId}/portfolios, workspace/${organizationId}/shared-analysis, workspace/${organizationId}/watchlist | YES | YES | YES | PASS | None | None |
| - | /properties/:id/documents | PropertyDocuments | AUTHENTICATED | properties/${id}, properties/${id}/documents/${documentId} | YES | YES | YES | PASS | None | None |
| - | /properties/:id/consent | PropertyConsent | AUTHENTICATED | properties/${id}/consent | YES | YES | YES | PASS | None | None |
| - | /properties/:id/result | PropertyResult | AUTHENTICATED | analysis/${id}/${type}, reports/${analysisRunId}/purchase-pdf | YES | YES | YES | PASS | None | None |
| Investor | /investor | InvestorDashboard | AUTHENTICATED | investor/dashboard | YES | YES | YES | PASS | None | None |
| Saved | /investor/saved-analyses | SavedAnalyses | AUTHENTICATED | investor/saved-analyses, investor/saved-analyses/${id} | YES | YES | YES | PASS | None | None |
| Watchlist | /investor/watchlist | Watchlist | AUTHENTICATED | investor/watchlist, investor/watchlist/${id} | YES | YES | YES | PASS | None | None |
| Portfolio | /investor/portfolio | PortfolioDashboard | AUTHENTICATED | investor/portfolio | YES | YES | YES | PASS | None | None |
| - | /investor/portfolio/:id | PortfolioDetail | AUTHENTICATED | investor/portfolio/${id}, investor/portfolio/${id}/items/${itemId} | YES | YES | YES | PASS | None | None |
| - | /investor/portfolio/:id/analytics | PortfolioAnalytics | AUTHENTICATED | investor/portfolio/${id}/analytics, investor/portfolio/${id}/benchmark, investor/portfolio/${id}/exposure, investor/portfolio/${id}/performance, investor/portfolio/${id}/scenarios | YES | YES | YES | PASS | None | None |
| Organizations | /organizations | Organizations | AUTHENTICATED | organizations | YES | YES | YES | PASS | None | None |
| - | /organizations/:id | OrganizationDetail | AUTHENTICATED | organizations/${id}, organizations/${id}/members | YES | YES | YES | PASS | None | None |
| - | /workspace/:organizationId/dashboard | WorkspaceDashboard | AUTHENTICATED | workspace/${organizationId}/dashboard | YES | YES | YES | PASS | None | None |
| - | /workspace/:organizationId/portfolio | WorkspacePortfolio | AUTHENTICATED | workspace/${organizationId}/portfolios | YES | YES | YES | PASS | None | None |
| - | /workspace/:organizationId/watchlist | WorkspaceWatchlist | AUTHENTICATED | workspace/${organizationId}/watchlist | YES | YES | YES | PASS | None | None |
| - | /workspace/:organizationId/activity | WorkspaceActivity | AUTHENTICATED | workspace/${organizationId}/activity, workspace/${organizationId}/shared-analysis | YES | YES | YES | PASS | None | None |
| Notifications | /notifications | NotificationInbox | AUTHENTICATED | notifications, notifications/${id}/archive, notifications/${id}/read, notifications/digests, notifications/test-event | YES | YES | YES | PASS | None | None |
| - | /notifications/preferences | NotificationPreferences | AUTHENTICATED | notifications/preferences | YES | YES | YES | PASS | None | None |
| - | * | NotFound | AUTHENTICATED | - | YES | YES | YES | WARN | No explicit apiFetch endpoint detected in component (might be static or child-driven). | Confirm child components or hooks handle API calls safely. |