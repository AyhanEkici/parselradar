# PRODUCTION EMAIL SAFE VERIFICATION PLAN

This document defines how to verify production email readiness without printing secrets or mutating provider/DNS configuration from code.

## 1) Preflight Checks
1. Confirm current status anchors:
   - Public launch: NOT_READY
   - Controlled beta: READY_FOR_CONTROLLED_BETA_CONTINUATION
2. Confirm approved operator and change window.
3. Confirm test recipient allowlist is approved.
4. Confirm rollback owner is assigned.

## 2) Env Presence Checks (No Secret Printing)
Check names only, report `PRESENT` or `MISSING`:
- `JWT_SECRET`
- `CLIENT_URL`
- `API_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- Optional: `NOTIFY_SMTP_HOST`, `NOTIFY_SMTP_PORT`, `NOTIFY_SMTP_SECURE`, `NOTIFY_SMTP_USER`, `NOTIFY_SMTP_PASS`, `NOTIFY_EMAIL_FROM`

Rules:
- Never echo values.
- Never export values in logs.
- Never persist secret values in repo evidence.

## 3) DNS Lookup Checks
Perform read-only lookups against production domain:
1. SPF TXT lookup
2. DKIM selector lookup(s)
3. DMARC TXT lookup (`_dmarc`)
4. Bounce/return-path lookup if provider requires

Capture only:
- Record exists: yes/no
- Syntax appears valid: yes/no
- Provider verification status: PASS/FAIL/PENDING

## 4) SPF/DKIM/DMARC Verification Approach
1. Compare DNS lookup outputs with provider-required record names (not values in repo docs).
2. Confirm provider dashboard marks sender domain authenticated.
3. Confirm `SMTP_FROM` domain aligns with verified domain.
4. Record timestamped evidence references (screenshots/log IDs) without secrets.

## 5) Production Password Reset Smoke Approach
1. Use approved non-sensitive test account.
2. Trigger `forgot-password` request once.
3. Confirm API returns generic non-leaking response.
4. Confirm provider acceptance event for the send.
5. Confirm recipient receives reset email and link opens reset page.
6. Complete reset with strong test password under policy.
7. Confirm sign-in works after reset.

## 6) Test Recipient Policy
- Allowed recipients: dedicated internal test inboxes only.
- Forbidden recipients: real customer distribution lists.
- Send volume: minimal, controlled, and auditable.

## 7) Evidence Capture Requirements
For each verification run capture:
- Run date/time and operator
- Env presence matrix (PRESENT/MISSING only)
- DNS check matrix (exists/verified only)
- Provider verification screenshot/reference ID
- Password reset smoke outcome and audit references
- Any failures and rollback action taken

## 8) Failure Classification
- CONFIG_MISSING: required env key missing
- DNS_MISALIGNED: SPF/DKIM/DMARC missing or invalid
- PROVIDER_UNVERIFIED: sender domain not verified
- DELIVERY_FAILED: provider rejects or bounces test mail
- UX_FLOW_FAILED: reset link/flow broken
- POLICY_VIOLATION: secret printed, unapproved recipient, or uncontrolled send

## 9) Rollback / Disable Procedure
1. Disable production sending path in provider or runtime toggle.
2. Revert to last known safe credential set in secret store.
3. Halt additional sends.
4. Re-run non-leaking API checks.
5. Log incident and keep public launch blocked.

## 10) Acceptance Criteria
Verification is accepted only when all conditions are met:
- Required env keys are PRESENT.
- SPF/DKIM/DMARC are verified.
- Provider sending domain is verified.
- Password reset smoke PASS with approved test recipient.
- No secret leakage and no policy violations.

If any criterion fails, remain blocked and classify NO-GO.

---

Scope control:
- This phase is documentation only.
- No script implementation is included here.
