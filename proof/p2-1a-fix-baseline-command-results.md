# P2.1A-FIX Baseline Command Results

- stage: STEP 3 — BASELINE SAFETY MATRIX
- overallStatus: PASS
- verify:platform-integrity: PASS
- verify:platform: WARN (fail=0, allowed)

## Command Matrix
- npm run build --prefix apps/api: PASS (tsc build complete)
- npm run build --prefix apps/web: PASS (vite build complete)
- npm run verify:connector-diagnostics-contract: PASS
- npm run verify:connector-diagnostics: PASS
- npm run verify:platform-integrity: PASS
- npm run verify:deployment-truth: PASS
- npm run verify:live-browser-mvp: PASS (5/5)
- npm run verify:rbac: PASS (57/57)
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

## Policy Gate
- blocking true FAIL present: no
- fix phase may proceed: yes
