# P2.1 Baseline Command Results

## Safety Matrix Status
- build/api: PASS
- build/web: PASS (chunk-size warning only)
- verify:connector-diagnostics-contract: PASS
- verify:connector-diagnostics: PASS
- verify:platform-integrity: PASS
- verify:deployment-truth: PASS
- verify:live-browser-mvp: PASS
- verify:rbac: PASS
- verify:platform: WARN (fail=0)
- verify:canonical-auth: PASS (allAuthMe200=true)
- verify:live-login-contract: PASS
- verify:session-persistence: PASS
- verify:auth-ui-consistency: PASS
- verify:post-login-api: PASS
- verify:admin-ux-email: PASS
- verify:route-wiring: PASS
- verify:auth-shell: PASS
- verify:navigation-persistence: PASS
- verify:browser-history: PASS

## Gate Decision
- verify:platform-integrity PASS: yes
- verify:platform fail count: 0
- true FAIL detected: no
- audit may proceed: yes
