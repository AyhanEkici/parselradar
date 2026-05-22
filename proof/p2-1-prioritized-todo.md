# P2.1 Prioritized TODO

Completeness score: 89%
Scoring basis: 125/141 COMPLETE entities

## production blockers
- [P0] route: /credits: Core flow blocker: Frontend calls missing API endpoints: stripe/create-checkout-session

## partial pages
- none

## placeholder mock areas
- none

## broken actions
- none

## missing apis
- [P2] POST /admin/deal-pool/:propertyId/accept: No frontend consumer detected for protected endpoint.
- [P2] POST /admin/deal-pool/:entryId/share: No frontend consumer detected for protected endpoint.
- [P2] GET /admin/security-overview: No frontend consumer detected for protected endpoint.
- [P2] POST /analysis/:propertyId/parsel-insight: No frontend consumer detected for protected endpoint.
- [P2] POST /analysis/:propertyId/developer-fit: No frontend consumer detected for protected endpoint.
- [P2] GET /auth/session-diagnostics: No frontend consumer detected for protected endpoint.
- [P2] GET /admin/telemetry: No frontend consumer detected for protected endpoint.
- [P2] POST /create-checkout-session: No frontend consumer detected for protected endpoint.
- [P1] ANY /stripe/*: Expected API group missing from route map: /stripe
- [P1] ANY /documents/*: Expected API group missing from route map: /documents
- [P1] ANY /admin/ogc/*: Expected API group missing from route map: /admin/ogc
- [P1] ANY /admin/tucbs/*: Expected API group missing from route map: /admin/tucbs

## role mismatches
- none

## payment credit report gaps
- [P1] /credits: Core flow blocker: Frontend calls missing API endpoints: stripe/create-checkout-session

## official evidence source labeling gaps
- [P2] apps/web/src/components/connectors/OgcServiceDiagnosticsCard.tsx: Evidence source labeling token hits need manual context review.
- [P2] apps/web/src/pages/AdminConnectors.tsx: Evidence source labeling token hits need manual context review.
- [P2] apps/web/src/pages/PropertyDetail.tsx: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/connectors/connectorContracts.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/connectors/connectorStatus.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/connectors/connectorTestRunner.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/connectors/demographicConnector.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/connectors/emailProviderConnector.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/connectors/infrastructureConnector.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/connectors/listingConnector.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/connectors/mapGeocodingConnector.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/connectors/municipalityConnector.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/connectors/municipalityPlanningConnector.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/connectors/ogc/ogcCapabilitiesClient.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/connectors/tkgmConnector.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/connectors/tkgmProductionConnector.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/controllers/adminController.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/controllers/authController.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/controllers/passwordResetController.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/middleware/auth.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/security/runtimeSecretsValidator.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/services/connectorActivation/activateConnectorIfEligible.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/services/connectorActivation/buildConnectorActivationPlan.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/services/connectorActivation/buildConnectorReadiness.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/services/coordination/municipalSignalCoordinator.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/services/governance/evidenceStrengthClassifier.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/services/governance/governanceTypes.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/services/operatingSystem/territorialOperatingSystem.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/services/provenance/sourceReliabilityClassifier.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/session/canonicalAuthValidator.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/session/sessionIntegrityValidator.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/session/tokenIntegrityValidator.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/testing/platformVerification.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/testing/verifyAuth.ts: Evidence source labeling token hits need manual context review.
- [P2] apps/api/src/testing/verifyConnectors.ts: Evidence source labeling token hits need manual context review.

## admin workflow gaps
- [P2] /admin/property-documents: Route is missing from App route wiring.

## connector readiness gaps
- none

## future non mvp items
- [P4] TUCBS official connector activation: Out of MVP scope; separate P2.2C legal/partner access phase.

## Top 10 next fixes
1. [P0] production_blockers - route: /credits: Core flow blocker: Frontend calls missing API endpoints: stripe/create-checkout-session
2. [P1] missing_apis - ANY /admin/ogc/*: Expected API group missing from route map: /admin/ogc
3. [P1] missing_apis - ANY /admin/tucbs/*: Expected API group missing from route map: /admin/tucbs
4. [P1] missing_apis - ANY /documents/*: Expected API group missing from route map: /documents
5. [P1] missing_apis - ANY /stripe/*: Expected API group missing from route map: /stripe
6. [P1] payment_credit_report_gaps - /credits: Core flow blocker: Frontend calls missing API endpoints: stripe/create-checkout-session
7. [P2] admin_workflow_gaps - /admin/property-documents: Route is missing from App route wiring.
8. [P2] missing_apis - GET /admin/security-overview: No frontend consumer detected for protected endpoint.
9. [P2] missing_apis - GET /admin/telemetry: No frontend consumer detected for protected endpoint.
10. [P2] missing_apis - GET /auth/session-diagnostics: No frontend consumer detected for protected endpoint.
