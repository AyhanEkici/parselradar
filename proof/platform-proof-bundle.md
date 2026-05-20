# Platform Proof Bundle

Generated at: 2026-05-20T21:25:43.689Z
Overall status: WARN
Git SHA: cd6a05a4307d7e4c8cd1873f090132ce6dcd364a
Dirty working tree: true

## Summary

- Sections: 12
- Checks: 345
- PASS: 330
- WARN: 12
- FAIL: 0
- SKIPPED: 3

## Admin

- Overall: WARN
- PASS: 12
- WARN: 1
- FAIL: 0
- SKIPPED: 0

| Status | Check | Message | Detail |
| --- | --- | --- | --- |
| WARN | Admin middleware enforces ADMIN role | Admin middleware does not clearly show an explicit ADMIN role check. |  |
| PASS | admin middleware file exists | Admin middleware file presence verified. |  |
| PASS | Admin route /admin/analyses | Expected admin route is declared. |  |
| PASS | Admin route /admin/credit-ledger | Expected admin route is declared. |  |
| PASS | Admin route /admin/deployment | Expected admin route is declared. |  |
| PASS | Admin route /admin/properties | Expected admin route is declared. |  |
| PASS | Admin route /admin/runtime | Expected admin route is declared. |  |
| PASS | Admin route /admin/stripe-sessions | Expected admin route is declared. |  |
| PASS | Admin route /admin/users | Expected admin route is declared. |  |
| PASS | Admin routes require auth and admin middleware | All admin routes are structurally gated by auth and admin middleware. |  |
| PASS | ADMIN_EMAIL readiness | ADMIN_EMAIL is present. | ADMIN_EMAIL=PRESENT |
| PASS | adminController file exists | Admin controller file presence verified. |  |
| PASS | adminRoutes file exists | Admin route file presence verified. |  |

## Auth

- Overall: WARN
- PASS: 10
- WARN: 1
- FAIL: 0
- SKIPPED: 0

| Status | Check | Message | Detail |
| --- | --- | --- | --- |
| WARN | Auth middleware validates JWT and user lookup | Auth middleware structure does not clearly prove JWT verification and user lookup. |  |
| PASS | Auth limiter on register/login/logout | Register, login, and logout routes are rate limited. |  |
| PASS | auth middleware file exists | Auth middleware file presence verified. |  |
| PASS | authController file exists | Auth controller file presence verified. |  |
| PASS | authRoutes file exists | Auth route file presence verified. |  |
| PASS | CLIENT_URL readiness | CLIENT_URL is present. | CLIENT_URL=PRESENT |
| PASS | JWT_SECRET readiness | JWT secret is present with acceptable length. | JWT_SECRET=PRESENT, length=96 |
| PASS | Route GET /auth/me | Expected auth route is declared. |  |
| PASS | Route POST /auth/login | Expected auth route is declared. |  |
| PASS | Route POST /auth/logout | Expected auth route is declared. |  |
| PASS | Route POST /auth/register | Expected auth route is declared. |  |

## Connectors

- Overall: WARN
- PASS: 50
- WARN: 7
- FAIL: 0
- SKIPPED: 0

| Status | Check | Message | Detail |
| --- | --- | --- | --- |
| WARN | Connector truth state demographic_feed | Static connector truth state resolved to NOT_CONFIGURED. | CONNECTOR_DEMOGRAPHIC_API_KEY=MISSING, CONNECTOR_DEMOGRAPHIC_ENDPOINT=MISSING |
| WARN | Connector truth state email_provider | Static connector truth state resolved to NOT_CONFIGURED. | NOTIFY_SMTP_HOST=MISSING, NOTIFY_SMTP_USER=MISSING, NOTIFY_SMTP_PASS=MISSING, NOTIFY_EMAIL_FROM=MISSING |
| WARN | Connector truth state infrastructure_feed | Static connector truth state resolved to NOT_CONFIGURED. | CONNECTOR_INFRA_API_KEY=MISSING, CONNECTOR_INFRA_ENDPOINT=MISSING |
| WARN | Connector truth state listing_feed | Static connector truth state resolved to NOT_CONFIGURED. | CONNECTOR_LISTING_API_KEY=MISSING, CONNECTOR_LISTING_ENDPOINT=MISSING |
| WARN | Connector truth state map_geocoding | Static connector truth state resolved to NOT_CONFIGURED. | CONNECTOR_MAPS_API_KEY=MISSING, CONNECTOR_MAPS_ENDPOINT=MISSING |
| WARN | Connector truth state municipality_zoning | Static connector truth state resolved to NOT_CONFIGURED. | CONNECTOR_MUNICIPALITY_TOKEN=MISSING, CONNECTOR_MUNICIPALITY_ENDPOINT=MISSING |
| WARN | Connector truth state tkgm_parcel | Static connector truth state resolved to NOT_CONFIGURED. | CONNECTOR_TKGM_API_KEY=MISSING, CONNECTOR_TKGM_ENDPOINT=MISSING |
| PASS | activateConnectorIfEligible.ts exists | Required connector activation service file is present. |  |
| PASS | AdminConnectorDetail.tsx exists (UI) | V23 connector planning UI surface file is present. |  |
| PASS | buildConnectorActivationAudit.ts exists | Required connector activation service file is present. |  |
| PASS | Connector live call policy is explicitly gated | Connector live calls stay gated behind CONNECTOR_TEST_MODE=active. |  |
| PASS | Connector live-call mode | Live connector calls remain disabled by configuration. | CONNECTOR_TEST_MODE=MISSING |
| PASS | Connector route /admin/connectors | Expected connector route is declared. |  |
| PASS | Connector route /admin/connectors/:connectorKey | Expected connector route is declared. |  |
| PASS | Connector route /admin/connectors/:connectorKey/activate | Expected connector route is declared. |  |
| PASS | Connector route /admin/connectors/:connectorKey/activation-plan | Expected connector route is declared. |  |
| PASS | Connector route /admin/connectors/:connectorKey/audit | Expected connector route is declared. |  |
| PASS | Connector route /admin/connectors/:connectorKey/credentials | Expected connector route is declared. |  |
| PASS | Connector route /admin/connectors/:connectorKey/deactivate | Expected connector route is declared. |  |
| PASS | Connector route /admin/connectors/:connectorKey/source-approval | Expected connector route is declared. |  |
| PASS | Connector route /admin/connectors/:connectorKey/test | Expected connector route is declared. |  |
| PASS | Connector route /admin/connectors/audit-trail | Expected connector route is declared. |  |
| PASS | Connector routes require auth and admin middleware | All connector routes are structurally gated by auth and admin middleware. |  |
| PASS | connectorActivationController.ts exists | Required connector surface file is present. |  |
| PASS | connectorActivationPolicies.ts exists | Required connector surface file is present. |  |
| PASS | ConnectorActivationRecord.ts exists | Required connector model file is present. |  |
| PASS | connectorActivationRoutes.ts exists | Required connector surface file is present. |  |
| PASS | ConnectorCredentialProfile.ts exists | Required connector model file is present. |  |
| PASS | connectorExecutionRegistry.ts exists | Required connector surface file is present. |  |
| PASS | connectorFreshnessTracker.ts exists | Required connector activation service file is present. |  |
| PASS | ConnectorRateLimitCard.tsx exists (UI) | V23 connector planning UI surface file is present. |  |
| PASS | connectorRateLimiter.ts exists | Required connector activation service file is present. |  |
| PASS | connectorRetryPolicy.ts exists | Required connector activation service file is present. |  |
| PASS | ConnectorRetryPolicyCard.tsx exists (UI) | V23 connector planning UI surface file is present. |  |
| PASS | ConnectorSourceApproval.ts exists | Required connector model file is present. |  |
| PASS | ConnectorTestRun.ts exists | Required connector model file is present. |  |
| PASS | deactivateConnector.ts exists | Required connector activation service file is present. |  |
| PASS | demographicConnector.ts exists | Connector contract file is present. |  |
| PASS | emailProviderConnector.ts exists | Connector contract file is present. |  |
| PASS | executeConnectorTestRun.ts exists | Required connector activation service file is present. |  |
| PASS | Execution registry uses V23 municipality planning connector | Connector execution registry references the V23 municipality planning connector. |  |
| PASS | Execution registry uses V23 TKGM connector | Connector execution registry references the V23 TKGM production connector. |  |
| PASS | getConnectorActivationState.ts exists | Required connector activation service file is present. |  |
| PASS | infrastructureConnector.ts exists | Connector contract file is present. |  |
| PASS | listingConnector.ts exists | Connector contract file is present. |  |
| PASS | mapGeocodingConnector.ts exists | Connector contract file is present. |  |
| PASS | municipalityConnector.ts exists | Connector contract file is present. |  |
| PASS | municipalityPlanningConnector.ts exists | V23 onboarding surface file is present. |  |
| PASS | Planning governance classifications defined | Planning payload normalizer defines governance classification labels. |  |
| PASS | PlanningGovernanceClassificationCard.tsx exists (UI) | V23 connector planning UI surface file is present. |  |
| PASS | PlanningLayerAvailabilityCard.tsx exists (UI) | V23 connector planning UI surface file is present. |  |
| PASS | planningPayloadNormalizer.ts exists | V23 onboarding surface file is present. |  |
| PASS | PlanningSourceFreshnessCard.tsx exists (UI) | V23 connector planning UI surface file is present. |  |
| PASS | storeConnectorCredentialProfile.ts exists | Required connector activation service file is present. |  |
| PASS | tkgmConnector.ts exists | Connector contract file is present. |  |
| PASS | tkgmProductionConnector.ts exists | V23 onboarding surface file is present. |  |
| PASS | validateConnectorSamplePayload.ts exists | Required connector activation service file is present. |  |

## Harness Safety

- Overall: PASS
- PASS: 15
- WARN: 0
- FAIL: 0
- SKIPPED: 0

| Status | Check | Message | Detail |
| --- | --- | --- | --- |
| PASS | Read-only scan buildProofBundle.ts | Verification source remains free of obvious mutating or external-call patterns. |  |
| PASS | Read-only scan platformVerification.ts | Verification source remains free of obvious mutating or external-call patterns. |  |
| PASS | Read-only scan verify-platform.ts | Verification source remains free of obvious mutating or external-call patterns. |  |
| PASS | Read-only scan verifyAdmin.ts | Verification source remains free of obvious mutating or external-call patterns. |  |
| PASS | Read-only scan verifyAuth.ts | Verification source remains free of obvious mutating or external-call patterns. |  |
| PASS | Read-only scan verifyConnectors.ts | Verification source remains free of obvious mutating or external-call patterns. |  |
| PASS | Read-only scan verifyInvestor.ts | Verification source remains free of obvious mutating or external-call patterns. |  |
| PASS | Read-only scan verifyModels.ts | Verification source remains free of obvious mutating or external-call patterns. |  |
| PASS | Read-only scan verifyNotifications.ts | Verification source remains free of obvious mutating or external-call patterns. |  |
| PASS | Read-only scan verifyObservability.ts | Verification source remains free of obvious mutating or external-call patterns. |  |
| PASS | Read-only scan verifyPortfolio.ts | Verification source remains free of obvious mutating or external-call patterns. |  |
| PASS | Read-only scan verifyRoutes.ts | Verification source remains free of obvious mutating or external-call patterns. |  |
| PASS | Read-only scan verifyRuntime.ts | Verification source remains free of obvious mutating or external-call patterns. |  |
| PASS | Read-only scan verifyWorkspace.ts | Verification source remains free of obvious mutating or external-call patterns. |  |
| PASS | VERIFY_PLATFORM_ALLOW_EXTERNAL default | External verification mode is not enabled by default. |  |

## Investor

- Overall: PASS
- PASS: 12
- WARN: 0
- FAIL: 0
- SKIPPED: 0

| Status | Check | Message | Detail |
| --- | --- | --- | --- |
| PASS | buildInvestorDashboardSummary.ts exists | Required investor surface file is present. |  |
| PASS | Investor route /investor/dashboard | Expected investor route is declared. |  |
| PASS | Investor route /investor/saved-analyses | Expected investor route is declared. |  |
| PASS | Investor route /investor/watchlist | Expected investor route is declared. |  |
| PASS | Investor routes require auth middleware | All investor routes are structurally gated by auth middleware. |  |
| PASS | investorController.ts exists | Required investor surface file is present. |  |
| PASS | InvestorDashboard.tsx exists | Required investor surface file is present. |  |
| PASS | investorRoutes.ts exists | Required investor surface file is present. |  |
| PASS | SavedAnalyses.tsx exists | Required investor surface file is present. |  |
| PASS | SavedAnalysis.ts exists | Required investor surface file is present. |  |
| PASS | Watchlist.ts exists | Required investor surface file is present. |  |
| PASS | Watchlist.tsx exists | Required investor surface file is present. |  |

## Models

- Overall: PASS
- PASS: 32
- WARN: 0
- FAIL: 0
- SKIPPED: 0

| Status | Check | Message | Detail |
| --- | --- | --- | --- |
| PASS | Model AnalysisRun.ts | Required model file is present. |  |
| PASS | Model ConnectorActivationRecord.ts | Required model file is present. |  |
| PASS | Model ConnectorCredentialProfile.ts | Required model file is present. |  |
| PASS | Model ConnectorSourceApproval.ts | Required model file is present. |  |
| PASS | Model ConnectorTestRun.ts | Required model file is present. |  |
| PASS | Model ConsentRecord.ts | Required model file is present. |  |
| PASS | Model CreditLedger.ts | Required model file is present. |  |
| PASS | Model DocumentUpload.ts | Required model file is present. |  |
| PASS | Model NotificationDelivery.ts | Required model file is present. |  |
| PASS | Model NotificationDigest.ts | Required model file is present. |  |
| PASS | Model NotificationEvent.ts | Required model file is present. |  |
| PASS | Model NotificationPreference.ts | Required model file is present. |  |
| PASS | Model Organization.ts | Required model file is present. |  |
| PASS | Model OrganizationMember.ts | Required model file is present. |  |
| PASS | Model Portfolio.ts | Required model file is present. |  |
| PASS | Model PortfolioItem.ts | Required model file is present. |  |
| PASS | Model PropertySubmission.ts | Required model file is present. |  |
| PASS | Model Report.ts | Required model file is present. |  |
| PASS | Model SavedAnalysis.ts | Required model file is present. |  |
| PASS | Model User.ts | Required model file is present. |  |
| PASS | Model Watchlist.ts | Required model file is present. |  |
| PASS | Model Workspace.ts | Required model file is present. |  |
| PASS | Model WorkspaceActivity.ts | Required model file is present. |  |
| PASS | Model WorkspacePortfolio.ts | Required model file is present. |  |
| PASS | Model WorkspaceWatchlist.ts | Required model file is present. |  |
| PASS | Service buildNotificationInbox.ts | Required service file is present. |  |
| PASS | Service buildWorkspaceActivityFeed.ts | Required service file is present. |  |
| PASS | Service calculatePortfolioBenchmark.ts | Required service file is present. |  |
| PASS | Service createPortfolioSnapshot.ts | Required service file is present. |  |
| PASS | Service executeConnectorTestRun.ts | Required service file is present. |  |
| PASS | Service getConnectorActivationState.ts | Required service file is present. |  |
| PASS | Service processNotificationDelivery.ts | Required service file is present. |  |

## Notifications

- Overall: WARN
- PASS: 20
- WARN: 1
- FAIL: 0
- SKIPPED: 0

| Status | Check | Message | Detail |
| --- | --- | --- | --- |
| WARN | Email notification delivery readiness | Email delivery env keys are incomplete. Notification delivery remains not configured. | NOTIFY_EMAIL_FROM=MISSING, NOTIFY_SMTP_HOST=MISSING, NOTIFY_SMTP_USER=MISSING, NOTIFY_SMTP_PASS=MISSING |
| PASS | buildNotificationInbox.ts exists | Required notifications surface file is present. |  |
| PASS | deliveryProviders.ts exists | Required notifications surface file is present. |  |
| PASS | Notification provider remains stub-safe | Configured email delivery still resolves to a stub-safe provider name. |  |
| PASS | Notification route /notifications | Expected notification route is declared. |  |
| PASS | Notification route /notifications/:id/archive | Expected notification route is declared. |  |
| PASS | Notification route /notifications/:id/read | Expected notification route is declared. |  |
| PASS | Notification route /notifications/digests | Expected notification route is declared. |  |
| PASS | Notification route /notifications/preferences | Expected notification route is declared. |  |
| PASS | Notification route /notifications/test-event | Expected notification route is declared. |  |
| PASS | Notification routes require auth middleware | All notification routes are structurally gated by auth middleware. |  |
| PASS | notificationController.ts exists | Required notifications surface file is present. |  |
| PASS | NotificationDelivery.ts exists | Required notifications surface file is present. |  |
| PASS | NotificationDigest.ts exists | Required notifications surface file is present. |  |
| PASS | NotificationEvent.ts exists | Required notifications surface file is present. |  |
| PASS | NotificationInbox.tsx exists | Required notifications surface file is present. |  |
| PASS | NotificationPreference.ts exists | Required notifications surface file is present. |  |
| PASS | NotificationPreferences.tsx exists | Required notifications surface file is present. |  |
| PASS | notificationRoutes.ts exists | Required notifications surface file is present. |  |
| PASS | processNotificationDelivery.ts exists | Required notifications surface file is present. |  |
| PASS | queueNotificationDelivery.ts exists | Required notifications surface file is present. |  |

## Observability

- Overall: PASS
- PASS: 17
- WARN: 0
- FAIL: 0
- SKIPPED: 0

| Status | Check | Message | Detail |
| --- | --- | --- | --- |
| PASS | AdminAnalytics.tsx exists | Required observability file is present. |  |
| PASS | AdminAuditTimeline.tsx exists | Required observability file is present. |  |
| PASS | AdminDeploymentOverview.tsx exists | Required observability file is present. |  |
| PASS | AdminObservability.tsx exists | Required observability file is present. |  |
| PASS | AdminSystemRuntime.tsx exists | Required observability file is present. |  |
| PASS | buildObservabilitySnapshot.ts exists | Required observability file is present. |  |
| PASS | buildOperationalSnapshot.ts exists | Required observability file is present. |  |
| PASS | healthController.ts exists | Required observability file is present. |  |
| PASS | livenessController.ts exists | Required observability file is present. |  |
| PASS | Observability route /admin/analytics | Expected observability route is declared. |  |
| PASS | Observability route /admin/observability | Expected observability route is declared. |  |
| PASS | Observability route /admin/telemetry | Expected observability route is declared. |  |
| PASS | Observability routes require auth and admin middleware | All observability routes are structurally gated by auth and admin middleware. |  |
| PASS | observabilityController.ts exists | Required observability file is present. |  |
| PASS | observabilityRoutes.ts exists | Required observability file is present. |  |
| PASS | readinessController.ts exists | Required observability file is present. |  |
| PASS | telemetryProvider.ts exists | Required observability file is present. |  |

## Portfolio

- Overall: PASS
- PASS: 19
- WARN: 0
- FAIL: 0
- SKIPPED: 0

| Status | Check | Message | Detail |
| --- | --- | --- | --- |
| PASS | calculatePortfolioBenchmark.ts exists | Required portfolio surface file is present. |  |
| PASS | createPortfolioSnapshot.ts exists | Required portfolio surface file is present. |  |
| PASS | Portfolio route /investor/portfolio | Expected portfolio route is declared. |  |
| PASS | Portfolio route /investor/portfolio/:id | Expected portfolio route is declared. |  |
| PASS | Portfolio route /investor/portfolio/:id/analytics | Expected portfolio route is declared. |  |
| PASS | Portfolio route /investor/portfolio/:id/benchmark | Expected portfolio route is declared. |  |
| PASS | Portfolio route /investor/portfolio/:id/exposure | Expected portfolio route is declared. |  |
| PASS | Portfolio route /investor/portfolio/:id/performance | Expected portfolio route is declared. |  |
| PASS | Portfolio route /investor/portfolio/:id/scenarios | Expected portfolio route is declared. |  |
| PASS | Portfolio routes require auth middleware | All portfolio routes are structurally gated by auth middleware. |  |
| PASS | Portfolio.ts exists | Required portfolio surface file is present. |  |
| PASS | PortfolioAnalytics.tsx exists | Required portfolio surface file is present. |  |
| PASS | portfolioAnalyticsController.ts exists | Required portfolio surface file is present. |  |
| PASS | portfolioAnalyticsRoutes.ts exists | Required portfolio surface file is present. |  |
| PASS | portfolioController.ts exists | Required portfolio surface file is present. |  |
| PASS | PortfolioDashboard.tsx exists | Required portfolio surface file is present. |  |
| PASS | PortfolioDetail.tsx exists | Required portfolio surface file is present. |  |
| PASS | PortfolioItem.ts exists | Required portfolio surface file is present. |  |
| PASS | portfolioRoutes.ts exists | Required portfolio surface file is present. |  |

## Routes

- Overall: PASS
- PASS: 93
- WARN: 0
- FAIL: 0
- SKIPPED: 0

| Status | Check | Message | Detail |
| --- | --- | --- | --- |
| PASS | Admin API gating GET /admin/analytics | Admin API route is structurally gated by auth + admin middleware. |  |
| PASS | Admin API gating GET /admin/connectors | Admin API route is structurally gated by auth + admin middleware. |  |
| PASS | Admin API gating GET /admin/connectors/:connectorKey | Admin API route is structurally gated by auth + admin middleware. |  |
| PASS | Admin API gating GET /admin/deployment | Admin API route is structurally gated by auth + admin middleware. |  |
| PASS | Admin API gating GET /admin/observability | Admin API route is structurally gated by auth + admin middleware. |  |
| PASS | Admin API gating GET /admin/runtime | Admin API route is structurally gated by auth + admin middleware. |  |
| PASS | Admin API gating GET /admin/telemetry | Admin API route is structurally gated by auth + admin middleware. |  |
| PASS | Admin API route GET /admin/analytics | Expected admin API route is declared in router files. |  |
| PASS | Admin API route GET /admin/connectors | Expected admin API route is declared in router files. |  |
| PASS | Admin API route GET /admin/connectors/:connectorKey | Expected admin API route is declared in router files. |  |
| PASS | Admin API route GET /admin/deployment | Expected admin API route is declared in router files. |  |
| PASS | Admin API route GET /admin/observability | Expected admin API route is declared in router files. |  |
| PASS | Admin API route GET /admin/runtime | Expected admin API route is declared in router files. |  |
| PASS | Admin API route GET /admin/telemetry | Expected admin API route is declared in router files. |  |
| PASS | adminRoutes default export | Route file exports default router. |  |
| PASS | adminRoutes file exists | Mounted route file is present. |  |
| PASS | adminRoutes mounted at /admin | Route mount found in index.ts. |  |
| PASS | analysisRoutes default export | Route file exports default router. |  |
| PASS | analysisRoutes file exists | Mounted route file is present. |  |
| PASS | analysisRoutes mounted at /analysis | Route mount found in index.ts. |  |
| PASS | API index file exists | apps/api/src/index.ts presence verified. |  |
| PASS | auditRoutes default export | Route file exports default router. |  |
| PASS | auditRoutes file exists | Mounted route file is present. |  |
| PASS | auditRoutes mounted at / | Route mount found in index.ts. |  |
| PASS | authRoutes default export | Route file exports default router. |  |
| PASS | authRoutes file exists | Mounted route file is present. |  |
| PASS | authRoutes mounted at /auth | Route mount found in index.ts. |  |
| PASS | connectorActivationRoutes default export | Route file exports default router. |  |
| PASS | connectorActivationRoutes file exists | Mounted route file is present. |  |
| PASS | connectorActivationRoutes mounted at / | Route mount found in index.ts. |  |
| PASS | consentRoutes default export | Route file exports default router. |  |
| PASS | consentRoutes file exists | Mounted route file is present. |  |
| PASS | consentRoutes mounted at /properties | Route mount found in index.ts. |  |
| PASS | creditRoutes default export | Route file exports default router. |  |
| PASS | creditRoutes file exists | Mounted route file is present. |  |
| PASS | creditRoutes mounted at /credits | Route mount found in index.ts. |  |
| PASS | Diagnostic route GET /__buildinfo | apps/api/src/index.ts declares GET /__buildinfo and responds with JSON. |  |
| PASS | documentRoutes default export | Route file exports default router. |  |
| PASS | documentRoutes file exists | Mounted route file is present. |  |
| PASS | documentRoutes mounted at /properties | Route mount found in index.ts. |  |
| PASS | exportRoutes default export | Route file exports default router. |  |
| PASS | exportRoutes file exists | Mounted route file is present. |  |
| PASS | exportRoutes mounted at /exports | Route mount found in index.ts. |  |
| PASS | Frontend page AdminAuditTimeline.tsx | Expected frontend page file is present. |  |
| PASS | Frontend page AdminConnectorDetail.tsx | Expected frontend page file is present. |  |
| PASS | Frontend page AdminConnectors.tsx | Expected frontend page file is present. |  |
| PASS | Frontend page AdminObservability.tsx | Expected frontend page file is present. |  |
| PASS | Frontend page Dashboard.tsx | Expected frontend page file is present. |  |
| PASS | Frontend page InvestorDashboard.tsx | Expected frontend page file is present. |  |
| PASS | Frontend page Login.tsx | Expected frontend page file is present. |  |
| PASS | Frontend page NotificationInbox.tsx | Expected frontend page file is present. |  |
| PASS | Frontend page NotificationPreferences.tsx | Expected frontend page file is present. |  |
| PASS | Frontend page PortfolioAnalytics.tsx | Expected frontend page file is present. |  |
| PASS | Frontend page PortfolioDashboard.tsx | Expected frontend page file is present. |  |
| PASS | Frontend page Register.tsx | Expected frontend page file is present. |  |
| PASS | Frontend page WorkspaceActivity.tsx | Expected frontend page file is present. |  |
| PASS | Frontend page WorkspaceDashboard.tsx | Expected frontend page file is present. |  |
| PASS | Health route /health | Health route is registered in index.ts. |  |
| PASS | Health route /health/live | Health route is registered in index.ts. |  |
| PASS | Health route /health/ready | Health route is registered in index.ts. |  |
| PASS | investorRoutes default export | Route file exports default router. |  |
| PASS | investorRoutes file exists | Mounted route file is present. |  |
| PASS | investorRoutes mounted at /investor | Route mount found in index.ts. |  |
| PASS | notificationRoutes default export | Route file exports default router. |  |
| PASS | notificationRoutes file exists | Mounted route file is present. |  |
| PASS | notificationRoutes mounted at / | Route mount found in index.ts. |  |
| PASS | observabilityRoutes default export | Route file exports default router. |  |
| PASS | observabilityRoutes file exists | Mounted route file is present. |  |
| PASS | observabilityRoutes mounted at / | Route mount found in index.ts. |  |
| PASS | organizationRoutes default export | Route file exports default router. |  |
| PASS | organizationRoutes file exists | Mounted route file is present. |  |
| PASS | organizationRoutes mounted at / | Route mount found in index.ts. |  |
| PASS | portfolioAnalyticsRoutes default export | Route file exports default router. |  |
| PASS | portfolioAnalyticsRoutes file exists | Mounted route file is present. |  |
| PASS | portfolioAnalyticsRoutes mounted at /investor | Route mount found in index.ts. |  |
| PASS | portfolioRoutes default export | Route file exports default router. |  |
| PASS | portfolioRoutes file exists | Mounted route file is present. |  |
| PASS | portfolioRoutes mounted at /investor | Route mount found in index.ts. |  |
| PASS | propertyRoutes default export | Route file exports default router. |  |
| PASS | propertyRoutes file exists | Mounted route file is present. |  |
| PASS | propertyRoutes mounted at /properties | Route mount found in index.ts. |  |
| PASS | reportRoutes default export | Route file exports default router. |  |
| PASS | reportRoutes file exists | Mounted route file is present. |  |
| PASS | reportRoutes mounted at /reports | Route mount found in index.ts. |  |
| PASS | sharedAnalysisRoutes default export | Route file exports default router. |  |
| PASS | sharedAnalysisRoutes file exists | Mounted route file is present. |  |
| PASS | sharedAnalysisRoutes mounted at / | Route mount found in index.ts. |  |
| PASS | stripeRoutes default export | Route file exports default router. |  |
| PASS | stripeRoutes file exists | Mounted route file is present. |  |
| PASS | stripeRoutes mounted at /stripe | Route mount found in index.ts. |  |
| PASS | workspaceRoutes default export | Route file exports default router. |  |
| PASS | workspaceRoutes file exists | Mounted route file is present. |  |
| PASS | workspaceRoutes mounted at / | Route mount found in index.ts. |  |

## Runtime

- Overall: WARN
- PASS: 23
- WARN: 2
- FAIL: 0
- SKIPPED: 3

| Status | Check | Message | Detail |
| --- | --- | --- | --- |
| WARN | Railway buildCommand includes apps/api build | railway.toml buildCommand does not include apps/api build. |  |
| WARN | Railway startCommand targets apps/api | railway.toml startCommand does not match expected apps/api start command. |  |
| SKIPPED | Nixpacks build includes apps/api build | nixpacks.toml not present; skipping Nixpacks build command check. |  |
| SKIPPED | Nixpacks start targets apps/api | nixpacks.toml not present; skipping Nixpacks start command check. |  |
| SKIPPED | Procfile web command targets apps/api | Procfile not present; skipping Procfile start command check. |  |
| PASS | API build script exists | API package build script presence verified. |  |
| PASS | API dist entrypoint exists | apps/api/dist/index.js exists (build output present). |  |
| PASS | API tsconfig exists | API TypeScript config presence verified. |  |
| PASS | Build metadata file present (generated) | apps/api/src/generated/buildInfo.ts is present in the workspace (generated by build/dev scripts). |  |
| PASS | Build metadata generator configured | apps/api prebuild/predev invokes build metadata generator. |  |
| PASS | bullmq truth state | bullmq resolved to DISABLED. | BullMQ is disabled because distributed runtime is off. |
| PASS | Core runtime env readiness | Core runtime env keys are present. | MONGODB_URI=PRESENT, JWT_SECRET=PRESENT, CLIENT_URL=PRESENT |
| PASS | jobs exists | Required runtime surface file or directory is present. |  |
| PASS | queueEvents.ts exists | Required runtime surface file or directory is present. |  |
| PASS | queueFactory.ts exists | Required runtime surface file or directory is present. |  |
| PASS | queues truth state | queues resolved to DISABLED. | Distributed queue backend is disabled. |
| PASS | redis truth state | redis resolved to DISABLED. | Distributed runtime is disabled by configuration. |
| PASS | redisClient.ts exists | Required runtime surface file or directory is present. |  |
| PASS | redisConfig.ts exists | Required runtime surface file or directory is present. |  |
| PASS | redisHealth.ts exists | Required runtime surface file or directory is present. |  |
| PASS | Root build script exists | Root package build script presence verified. |  |
| PASS | runtimeConfig.ts exists | Required runtime surface file or directory is present. |  |
| PASS | runtimeState.ts exists | Required runtime surface file or directory is present. |  |
| PASS | VERIFY_PLATFORM_ALLOW_EXTERNAL mode | External verification mode is not enabled. | VERIFY_PLATFORM_ALLOW_EXTERNAL=MISSING |
| PASS | Web build script exists | Web package build script presence verified. |  |
| PASS | Web tsconfig exists | Web TypeScript config presence verified. |  |
| PASS | workerFactory.ts exists | Required runtime surface file or directory is present. |  |
| PASS | workers truth state | workers resolved to DISABLED. | Workers are disabled because distributed runtime is off. |

## Workspace

- Overall: PASS
- PASS: 27
- WARN: 0
- FAIL: 0
- SKIPPED: 0

| Status | Check | Message | Detail |
| --- | --- | --- | --- |
| PASS | buildSharedPortfolioSummary.ts exists | Required workspace surface file is present. |  |
| PASS | buildWorkspaceActivityFeed.ts exists | Required workspace surface file is present. |  |
| PASS | Organization.ts exists | Required workspace surface file is present. |  |
| PASS | organizationController.ts exists | Required workspace surface file is present. |  |
| PASS | OrganizationDetail.tsx exists | Required workspace surface file is present. |  |
| PASS | OrganizationMember.ts exists | Required workspace surface file is present. |  |
| PASS | organizationRoutes.ts exists | Required workspace surface file is present. |  |
| PASS | Organizations.tsx exists | Required workspace surface file is present. |  |
| PASS | sharedAnalysisController.ts exists | Required workspace surface file is present. |  |
| PASS | sharedAnalysisRoutes.ts exists | Required workspace surface file is present. |  |
| PASS | Workspace route /organizations | Expected workspace route is declared. |  |
| PASS | Workspace route /workspace/:organizationId/activity | Expected workspace route is declared. |  |
| PASS | Workspace route /workspace/:organizationId/dashboard | Expected workspace route is declared. |  |
| PASS | Workspace route /workspace/:organizationId/portfolios | Expected workspace route is declared. |  |
| PASS | Workspace route /workspace/:organizationId/shared-analysis | Expected workspace route is declared. |  |
| PASS | Workspace route /workspace/:organizationId/watchlist | Expected workspace route is declared. |  |
| PASS | Workspace routes require auth middleware | All workspace and organization routes are structurally gated by auth middleware. |  |
| PASS | Workspace.ts exists | Required workspace surface file is present. |  |
| PASS | WorkspaceActivity.ts exists | Required workspace surface file is present. |  |
| PASS | WorkspaceActivity.tsx exists | Required workspace surface file is present. |  |
| PASS | workspaceController.ts exists | Required workspace surface file is present. |  |
| PASS | WorkspaceDashboard.tsx exists | Required workspace surface file is present. |  |
| PASS | WorkspacePortfolio.ts exists | Required workspace surface file is present. |  |
| PASS | WorkspacePortfolio.tsx exists | Required workspace surface file is present. |  |
| PASS | workspaceRoutes.ts exists | Required workspace surface file is present. |  |
| PASS | WorkspaceWatchlist.ts exists | Required workspace surface file is present. |  |
| PASS | WorkspaceWatchlist.tsx exists | Required workspace surface file is present. |  |

