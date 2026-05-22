# P2.2A-LITE Closeout Final Command Results

Results:
- `npm run test:tucbs-candidates`: WARN
  - 5 total, 2 passed, 3 failed, 2 test-only, 0 manual-review-needed
- `npm run verify:connector-diagnostics-contract`: PASS
- `npm run verify:connector-diagnostics`: PASS
- `npm run verify:platform-integrity`: PASS
- `npm run build --prefix apps/api`: PASS
- `npm run build --prefix apps/web`: PASS with a Vite chunk-size warning
- `npm run verify:deployment-truth`: PASS
- `npm run verify:live-browser-mvp`: PASS
  - 5 total, 5 pass, 0 fail, 0 blocked
- `npm run verify:rbac`: PASS
  - 57 total, 57 pass, 0 fail
- `npm run verify:platform`: WARN
  - 345 checks, 330 pass, 12 warn, 0 fail, 3 skipped
- `npm run verify:canonical-auth`: PASS
- `npm run verify:live-login-contract`: PASS
- `npm run verify:session-persistence`: PASS
  - 16 total, 16 pass, 0 fail
- `npm run verify:auth-ui-consistency`: PASS
  - 11 total, 11 pass, 0 fail
- `npm run verify:post-login-api`: PASS
  - 8 total, 8 pass, 0 fail
- `npm run verify:admin-ux-email`: PASS
  - 15 total, 15 pass, 0 fail
- `npm run verify:route-wiring`: PASS
- `npm run verify:auth-shell`: PASS
- `npm run verify:navigation-persistence`: PASS
- `npm run verify:browser-history`: PASS

Conclusion:
- the closeout matrix is green apart from the expected diagnostic warnings and the intentionally non-failing TUCBS candidate probe
