# U1 PILOT RUNBOOK

## 1. Pilot Invite Flow
- Send invite email to pilot users with registration link
- Track invite status

## 2. First Login
- User registers and logs in
- Confirm email verification if enabled

## 3. Stripe Purchase
- User initiates Stripe checkout from dashboard
- Complete payment with real card (production only)
- Confirm credit is added to account

## 4. Property Creation
- User creates a new property
- Validate property appears in dashboard

## 5. Quick-Score
- User runs quick-score analysis
- Confirm result is returned and displayed

## 6. Support Checklist
- Provide support contact for pilot users
- Track and resolve pilot issues

## 7. Rollback/Escalation Steps
- If critical issue, restore last green tag (restorepoint-deployment-pilot-readiness-green)
- Notify pilot users of downtime

## 8. Audit Verification
- Confirm all pilot actions are logged in audit timeline

## 9. Credit Verification
- Confirm credit ledger updates after purchase and analysis
