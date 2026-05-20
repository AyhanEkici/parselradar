# RBAC Proof Bundle

Generated at: 2026-05-20T21:59:39.191Z
Overall status: PASS

## Summary
- Total checks: 57
- PASS: 57
- FAIL: 0

## Checks
| Status | Check ID | Message |
| --- | --- | --- |
| PASS | admin_file_/admin/properties | Route file exists for /admin/properties |
| PASS | admin_declared_/admin/properties | /admin/properties is declared |
| PASS | admin_guarded_/admin/properties | /admin/properties enforces auth+admin middleware |
| PASS | admin_file_/admin/observability | Route file exists for /admin/observability |
| PASS | admin_declared_/admin/observability | /admin/observability is declared |
| PASS | admin_guarded_/admin/observability | /admin/observability enforces auth+admin middleware |
| PASS | admin_file_/admin/analytics | Route file exists for /admin/analytics |
| PASS | admin_declared_/admin/analytics | /admin/analytics is declared |
| PASS | admin_guarded_/admin/analytics | /admin/analytics enforces auth+admin middleware |
| PASS | admin_file_/admin/connectors | Route file exists for /admin/connectors |
| PASS | admin_declared_/admin/connectors | /admin/connectors is declared |
| PASS | admin_guarded_/admin/connectors | /admin/connectors enforces auth+admin middleware |
| PASS | route_file_propertyRoutes.ts | propertyRoutes.ts exists |
| PASS | route_auth_propertyRoutes.ts | propertyRoutes.ts routes are auth-guarded |
| PASS | route_file_analysisRoutes.ts | analysisRoutes.ts exists |
| PASS | route_auth_analysisRoutes.ts | analysisRoutes.ts routes are auth-guarded |
| PASS | route_file_reportRoutes.ts | reportRoutes.ts exists |
| PASS | route_auth_reportRoutes.ts | reportRoutes.ts routes are auth-guarded |
| PASS | route_file_documentRoutes.ts | documentRoutes.ts exists |
| PASS | route_auth_documentRoutes.ts | documentRoutes.ts routes are auth-guarded |
| PASS | route_file_portfolioRoutes.ts | portfolioRoutes.ts exists |
| PASS | route_auth_portfolioRoutes.ts | portfolioRoutes.ts routes are auth-guarded |
| PASS | route_file_investorRoutes.ts | investorRoutes.ts exists |
| PASS | route_auth_investorRoutes.ts | investorRoutes.ts routes are auth-guarded |
| PASS | route_file_notificationRoutes.ts | notificationRoutes.ts exists |
| PASS | route_auth_notificationRoutes.ts | notificationRoutes.ts routes are auth-guarded |
| PASS | route_file_workspaceRoutes.ts | workspaceRoutes.ts exists |
| PASS | route_auth_workspaceRoutes.ts | workspaceRoutes.ts routes are auth-guarded |
| PASS | route_file_exportRoutes.ts | exportRoutes.ts exists |
| PASS | route_auth_exportRoutes.ts | exportRoutes.ts routes are auth-guarded |
| PASS | controller_exists_propertyController.ts | C:\parselradar\apps\api\src\controllers\propertyController.ts exists |
| PASS | scope_helper_propertyController.ts | Owner scope helper usage detected |
| PASS | owner_guard_propertyController.ts | Owner guard patterns detected |
| PASS | controller_exists_analysisController.ts | C:\parselradar\apps\api\src\controllers\analysisController.ts exists |
| PASS | scope_helper_analysisController.ts | Owner scope helper usage detected |
| PASS | owner_guard_analysisController.ts | Owner guard patterns detected |
| PASS | controller_exists_reportController.ts | C:\parselradar\apps\api\src\controllers\reportController.ts exists |
| PASS | scope_helper_reportController.ts | Owner scope helper usage detected |
| PASS | owner_guard_reportController.ts | Owner guard patterns detected |
| PASS | controller_exists_documentController.ts | C:\parselradar\apps\api\src\controllers\documentController.ts exists |
| PASS | scope_helper_documentController.ts | Owner scope helper usage detected |
| PASS | owner_guard_documentController.ts | Owner guard patterns detected |
| PASS | controller_exists_portfolioController.ts | C:\parselradar\apps\api\src\controllers\portfolioController.ts exists |
| PASS | scope_helper_portfolioController.ts | Owner scope helper usage detected |
| PASS | owner_guard_portfolioController.ts | Owner guard patterns detected |
| PASS | controller_exists_investorController.ts | C:\parselradar\apps\api\src\controllers\investorController.ts exists |
| PASS | scope_helper_investorController.ts | Owner scope helper usage detected |
| PASS | owner_guard_investorController.ts | Owner guard patterns detected |
| PASS | controller_exists_notificationController.ts | C:\parselradar\apps\api\src\controllers\notificationController.ts exists |
| PASS | scope_helper_notificationController.ts | Owner scope helper usage detected |
| PASS | owner_guard_notificationController.ts | Owner guard patterns detected |
| PASS | controller_exists_workspaceController.ts | C:\parselradar\apps\api\src\controllers\workspaceController.ts exists |
| PASS | scope_helper_workspaceController.ts | Membership-based scope guard usage detected |
| PASS | owner_guard_workspaceController.ts | Owner guard patterns detected |
| PASS | controller_exists_exportController.ts | C:\parselradar\apps\api\src\controllers\exportController.ts exists |
| PASS | scope_helper_exportController.ts | Owner scope helper usage detected |
| PASS | owner_guard_exportController.ts | Owner guard patterns detected |

## Manual Test Scenarios
- Admin login: admin tabs visible; global admin/connector/observability/deployment routes accessible.
- Normal user (Mahir): admin menu hidden; /admin/* resolves to access denied; only own properties/reports/portfolios/documents visible.
- Another normal user: cannot read Mahir-owned records by list, detail, export, or direct ID route.

