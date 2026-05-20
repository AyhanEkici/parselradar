# Auth Route Proof Bundle

Generated at: 2026-05-20T08:23:00.618Z
Overall status: PASS

| Check | Status | Detail |
| --- | --- | --- |
| indexMountsAuthRoutes | PASS | app.use('/auth', authRoutes) found in index.ts |
| authRoutesImportsPasswordReset | PASS | passwordResetRoutes imported in authRoutes.ts |
| authRoutesMountsPasswordReset | PASS | router.use('/', passwordResetRoutes) found in authRoutes.ts |
| passwordResetRoutesForgotPost | PASS | POST /forgot-password registered in passwordResetRoutes.ts |
| passwordResetRoutesResetPost | PASS | POST /reset-password registered in passwordResetRoutes.ts |
| forgotPasswordControllerExported | PASS | forgotPassword exported from passwordResetController.ts |
| resetPasswordControllerExported | PASS | resetPassword exported from passwordResetController.ts |
| forgotPasswordRateLimiterExists | PASS | forgotPasswordLimiter defined in passwordResetRateLimiter.ts |
| resetPasswordRateLimiterExists | PASS | resetPasswordLimiter defined in passwordResetRateLimiter.ts |
| authRouteMountBeforeJsonFallback | PASS | /auth routes mounted before 404 JSON fallback |
| distAuthRoutesHasPasswordReset | PASS | passwordResetRoutes present in compiled dist/routes/authRoutes.js |
| distPasswordResetRoutesHasForgot | PASS | forgot-password present in compiled dist/routes/passwordResetRoutes.js |
| distPasswordResetRoutesHasReset | PASS | reset-password present in compiled dist/routes/passwordResetRoutes.js |
| distIndexMountsAuthRoutes | PASS | /auth + authRoutes present in compiled dist/index.js |

## Commit Hash

- 

