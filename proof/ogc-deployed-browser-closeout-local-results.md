# OGC Deployed Browser Closeout - Local Results

Scope: local-pre-commit

Summary:
- PASS: 19
- WARN: 1
- FAIL: 0
- SCRIPT_MISSING: 0

Note:
- WARN_ACCEPTABLE_ONLY_IF_FAIL_ZERO: `npm run verify:platform` returned WARN with fail=0.

Command Results:
- PASS - npm run build --prefix apps/api: tsc --build --force completed.
- PASS - npm run build --prefix apps/web: vite build completed.
- PASS - npm run verify:connector-diagnostics-contract: overallStatus=PASS.
- PASS - npm run verify:connector-diagnostics: overallStatus=PASS.
- PASS - npm run verify:deployment-truth: overallStatus=PASS.
- PASS - npm run verify:live-browser-mvp: overallStatus=PASS.
- PASS - npm run verify:platform-integrity: overallStatus=PASS.
- PASS - npm run verify:rbac: status=PASS, fail=0.
- WARN - npm run verify:platform: WARN, fail=0, pass=330, warn=12.
- PASS - npm run verify:canonical-auth: overallStatus=PASS.
- PASS - npm run verify:live-login-contract: overallStatus=PASS.
- PASS - npm run verify:session-persistence: overallStatus=PASS.
- PASS - npm run verify:auth-ui-consistency: overallStatus=PASS.
- PASS - npm run verify:post-login-api: overallStatus=PASS.
- PASS - npm run verify:admin-ux-email: overallStatus=PASS.
- PASS - npm run verify:route-wiring: overallStatus=PASS.
- PASS - npm run verify:auth-shell: overallStatus=PASS.
- PASS - npm run verify:navigation-persistence: overallStatus=PASS.
- PASS - npm run verify:browser-history: overallStatus=PASS.
- PASS - LIVE_VERIFY_PILOT_PASSWORD set/unset around live checks.
