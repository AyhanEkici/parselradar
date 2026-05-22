# P2.1A-FIX-2 Baseline Command Results

- overallStatus: PASS
- verify:platform-integrity: PASS
- verify:platform: WARN (fail=0 allowed)

## Command Matrix
- npm run build --prefix apps/api: PASS
- npm run build --prefix apps/web: PASS
- npm run verify:connector-diagnostics-contract: PASS
- npm run verify:connector-diagnostics: PASS
- npm run verify:platform-integrity: PASS
- npm run verify:deployment-truth: PASS
- npm run verify:live-browser-mvp: PASS
- npm run verify:rbac: PASS
- npm run verify:platform: WARN (fail=0)
- npm run verify:canonical-auth: PASS
- npm run verify:live-login-contract: PASS
- npm run verify:session-persistence: PASS
- npm run verify:auth-ui-consistency: PASS
- npm run verify:post-login-api: PASS
- npm run verify:admin-ux-email: PASS
- npm run verify:route-wiring: PASS
- npm run verify:auth-shell: PASS
- npm run verify:navigation-persistence: PASS
- npm run verify:browser-history: PASS
