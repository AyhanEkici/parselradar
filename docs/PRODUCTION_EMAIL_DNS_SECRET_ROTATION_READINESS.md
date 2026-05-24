# Production Email DNS Secret Rotation Readiness

## 1) Purpose
Define production readiness governance for SMTP, DNS alignment, and secret rotation without performing operational changes in this phase.

## 2) Current controlled-beta email posture
Controlled beta remains functional with limited/non-production email posture. Production sender authenticity and launch-grade deliverability are not yet complete.

## 3) Production SMTP requirements
Required for public launch:
- approved production mail provider
- authenticated sender domain
- production-grade SMTP host/port/security settings
- transactional flow validation (password reset and required notifications)

## 4) DNS requirements
### SPF
- publish valid SPF policy for sending domain
- ensure provider include mechanism is correct

### DKIM
- publish provider DKIM selectors
- provider verification must pass

### DMARC
- publish DMARC policy
- reporting targets and policy must be explicit

## 5) Secret rotation requirements
Required before public launch:
- rotate mail credentials
- rotate auth/session secrets where applicable
- rotate other production-sensitive credentials per runbook
- verify continuity after rotation

## 6) Mail provider decision checklist
- deliverability reliability
- domain authentication support
- bounce/complaint handling
- operational visibility and alerting
- security and access controls
- cost and rate limits

## 7) Required environment variables
Names only (no values):
- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE
- SMTP_USER
- SMTP_PASS or SMTP_PASSWORD
- SMTP_FROM
- optional notification transport variables if enabled

## 8) Test-mode vs production-mode boundary
- test/sandbox mode is acceptable for controlled beta operations
- production mode requires verified sender domain + DNS alignment + operational monitoring
- test mode PASS does not equal production readiness

## 9) Password reset / transactional email smoke checklist
- forgot password endpoint behavior
- reset completion email behavior
- provider acceptance
- inbox placement sanity
- bounce/reject checks
- no secret leakage in logs or proofs

## 10) No-secret-printing policy
- never print credential values
- only report configured/missing states
- never commit secrets to repo
- use approved secret stores only

## 11) Rollback plan
If production email rollout causes issues:
1. switch traffic to safe fallback mode
2. revert provider config in secret store
3. validate password reset and critical email paths
4. document incident and remediation

## 12) Public launch blocker status
Production SMTP/DNS/secret rotation remains a PUBLIC_LAUNCH_BLOCKER.

## 13) Controlled beta status
Not a blocker for founder-led controlled beta continuation.

## 14) Final go/no-go checklist
Go only if all are true:
- SMTP provider production config complete
- SPF/DKIM/DMARC verified
- secret rotation completed and verified
- transactional email smoke PASS
- no credential exposure incidents

Current recommendation: NO-GO for public launch until above checks pass.
