# MVP Route Action Map

Generated at: 2026-05-21T20:46:18.359Z
Total routes audited: 21

| route | page/component | requiredRole | visibleNavLabel | primaryActions | backendEndpointsUsed | currentStatus | issue | severity | fixRequired | priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /dashboard | Dashboard | AUTHENTICATED | dashboard | button:{ await logout(); navigate('/login', { replace: true }); }}>Çıkış Yap, link:/properties/new, link:/reports, link:/credits | credits | COMPLETE | None | LOW | None | P3 |
| /credits | Credits | AUTHENTICATED | credits | button:handleCheckout(amount)}>{amount} Kredi, button:Dev Only: 10 Kredi Ekle | credits, credits/dev-add, stripe/create-checkout-session | COMPLETE | None | LOW | None | P3 |
| /reports | Reports | AUTHENTICATED | reports | button:handlePurchase(r)} > {buyingId === r._id ? 'Satın alınıyor...' : 'PDF Satın Al'}, button:handleDownload(r)} > {downloadingId === r._id ? 'İndiriliyor...' : 'İndir'} | /reports/${report.analysisRunId}/purchase-pdf, reports | COMPLETE | None | LOW | None | P3 |
| /admin/analyses | AdminAnalyses | ADMIN | Analyses | - | /admin/analyses?${params.toString()} | COMPLETE | None | LOW | None | P3 |
| /investor | InvestorDashboard | AUTHENTICATED | Investor | link:/investor/saved-analyses, link:/investor/watchlist, link:/investor/portfolio | investor/dashboard | COMPLETE | None | LOW | None | P3 |
| /investor/saved-analyses | SavedAnalyses | AUTHENTICATED | Saved | - | investor/saved-analyses, investor/saved-analyses/${id} | COMPLETE | None | LOW | None | P3 |
| /investor/watchlist | Watchlist | AUTHENTICATED | Watchlist | - | investor/watchlist, investor/watchlist/${id} | COMPLETE | None | LOW | None | P3 |
| /investor/portfolio | PortfolioDashboard | AUTHENTICATED | Portfolio | button:{creating ? 'Creating...' : 'Create'} | investor/portfolio, investor/portfolio/${portfolio._id} | COMPLETE | None | LOW | None | P3 |
| /organizations | Organizations | AUTHENTICATED | Organizations | button:{creating ? 'Creating...' : 'Create'} | organizations | COMPLETE | None | LOW | None | P3 |
| /notifications | NotificationInbox | AUTHENTICATED | Notifications | button:Create Test Event, link:/notifications/preferences | notifications, notifications/${id}/archive, notifications/${id}/read, notifications/digests, notifications/test-event | COMPLETE | None | LOW | None | P3 |
| /admin/users | AdminUsers | ADMIN | Users | - | /admin/audit-events?type=admin_user_role_updated&page=1&limit=5, /admin/email-delivery-state, /admin/users/${targetUserId}/role, /admin/users?${params.toString()} | COMPLETE | None | LOW | None | P3 |
| /admin/analyses | AdminAnalyses | ADMIN | Analyses | - | /admin/analyses?${params.toString()} | COMPLETE | None | LOW | None | P3 |
| /admin/credit-ledger | AdminCreditLedger | ADMIN | Credit Ledger | - | /admin/credit-ledger?${params.toString()} | COMPLETE | None | LOW | None | P3 |
| /admin/stripe-sessions | AdminStripeSessions | ADMIN | Stripe Sessions | - | /admin/stripe-sessions?${params.toString()} | COMPLETE | None | LOW | None | P3 |
| /admin/properties | AdminProperties | ADMIN | Properties | - | /admin/properties | COMPLETE | None | LOW | None | P3 |
| /admin/runtime | AdminSystemRuntime | ADMIN | Runtime | - | /admin/runtime | COMPLETE | None | LOW | None | P3 |
| /admin/deployment | AdminDeploymentOverview | ADMIN | Deployment | - | /admin/deployment | COMPLETE | None | LOW | None | P3 |
| /admin/observability | AdminObservability | ADMIN | Observability | - | /admin/analyses?page=1, /admin/observability | COMPLETE | None | LOW | None | P3 |
| /admin/analytics | AdminAnalytics | ADMIN | Analytics | - | /admin/analytics | COMPLETE | None | LOW | None | P3 |
| /admin/connectors | AdminConnectors | ADMIN | Connectors | - | /admin/connectors, /admin/connectors/audit-trail | COMPLETE | None | LOW | None | P3 |
| /admin/audit-timeline | AdminAuditTimeline | ADMIN | Audit | - | /admin/audit-events?${params.toString()} | COMPLETE | None | LOW | None | P3 |
