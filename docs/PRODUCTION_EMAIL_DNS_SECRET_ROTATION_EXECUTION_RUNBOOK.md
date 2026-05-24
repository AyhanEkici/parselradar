# PRODUCTION EMAIL DNS SECRET ROTATION EXECUTION RUNBOOK

## 1) Purpose
Provide a safe, manual execution checklist for production email, DNS alignment, and secret rotation before public launch.

## 2) Public Launch Blocker Statement
Production SMTP, DNS authentication, and secret rotation remain a public-launch blocker until all checks in this runbook pass.

## 3) Current Status
- Public launch: NOT_READY
- Controlled beta: READY_FOR_CONTROLLED_BETA_CONTINUATION
- Production email/DNS/secret posture: EXECUTION_PENDING_MANUAL_STEPS
- This runbook is planning/execution guidance only.

## 4) Required Secrets And Environment Variables (Names Only)
No values are stored in this repository. Enter values manually in approved secret stores.

### 4.1 Contract Classification
| Variable Name | Classification | Notes |
| --- | --- | --- |
| JWT_SECRET | REQUIRED_FOR_PRODUCTION | Runtime/auth signing secret. |
| CLIENT_URL | REQUIRED_FOR_PRODUCTION | Password reset link base and runtime contract. |
| API_URL | REQUIRED_FOR_PRODUCTION | Runtime/API routing contract in deployed env. |
| SMTP_HOST | REQUIRED_FOR_PRODUCTION | Required for password reset email transport. |
| SMTP_PORT | REQUIRED_FOR_PRODUCTION | SMTP transport port. |
| SMTP_SECURE | REQUIRED_FOR_PRODUCTION | SMTP TLS mode flag. |
| SMTP_USER | REQUIRED_FOR_PRODUCTION | SMTP auth identity. |
| SMTP_PASS | REQUIRED_FOR_PRODUCTION | SMTP auth secret (primary key used in code). |
| SMTP_FROM | REQUIRED_FOR_PRODUCTION | Sender identity for transactional email. |
| NOTIFY_SMTP_HOST | OPTIONAL | Optional notification transport path. |
| NOTIFY_SMTP_PORT | OPTIONAL | Optional notification transport path. |
| NOTIFY_SMTP_SECURE | OPTIONAL | Optional notification transport path. |
| NOTIFY_SMTP_USER | OPTIONAL | Optional notification transport path. |
| NOTIFY_SMTP_PASS | OPTIONAL | Optional notification transport path. |
| NOTIFY_EMAIL_FROM | OPTIONAL | Optional notification transport path. |
| SMTP_PASSWORD | UNKNOWN | Mentioned in some docs/examples; code path primarily uses SMTP_PASS. Keep as alias mapping decision for ops. |
| RESET_TOKEN_SECRET | UNKNOWN | No dedicated key found in current password-reset token implementation. |

### 4.2 Documentation Coverage
- CURRENTLY_DOCUMENTED: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `JWT_SECRET`, `CLIENT_URL`, `API_URL`, `NOTIFY_SMTP_*`, `NOTIFY_EMAIL_FROM`.
- MISSING_FROM_DOCS_OR_NEEDS_CLARIFICATION: explicit alias policy for `SMTP_PASSWORD` vs `SMTP_PASS`, and explicit statement that `RESET_TOKEN_SECRET` is not currently used as a separate key.

## 5) Required DNS Records (Placeholders Only)
Do not apply records from this repository. Use provider-issued values.

- SPF (TXT):
  - Host: `@` (or provider-required host)
  - Value: `<MAIL_PROVIDER_SPF_VALUE>`
- DKIM (TXT/CNAME per provider):
  - Name: `<MAIL_PROVIDER_DKIM_NAME>`
  - Value: `<MAIL_PROVIDER_DKIM_VALUE>`
- DMARC (TXT):
  - Host: `_dmarc`
  - Value: `<DMARC_POLICY_VALUE>`
- Return-path / bounce domain (if provider requires):
  - Name: `<MAIL_PROVIDER_BOUNCE_NAME>`
  - Value: `<MAIL_PROVIDER_BOUNCE_VALUE>`
- Verified sending domain:
  - Provider dashboard status must be VERIFIED.
- Sender/from alignment:
  - `SMTP_FROM` domain must align with verified sender domain.
- MX:
  - Not required unless inbound mail processing is explicitly needed.

## 6) Mail Provider Setup Checklist
1. Confirm selected production mail provider and account owner.
2. Enable domain authentication flow in provider dashboard.
3. Configure sending domain and sender identity.
4. Collect SPF/DKIM/DMARC and bounce-domain records from provider.
5. Enter SMTP credentials in production secret store (names only in this repo).
6. Confirm provider-side suppression/bounce visibility is enabled.

## 7) Secret Rotation Checklist
1. Rotate SMTP credential set (user/pass or API-backed SMTP token).
2. Rotate `JWT_SECRET`.
3. Rotate any production-only admin/test credentials used during pilot.
4. Rotate payment and webhook secrets if production live mode is active.
5. Remove stale or temporary verification credentials from all stores.
6. Record rotation timestamp, owner, and evidence references.
7. Verify runtime continuity after each rotation wave.

## 8) DNS Verification Checklist
1. Validate SPF lookup returns expected provider include policy.
2. Validate each DKIM selector resolves and provider marks PASS.
3. Validate DMARC record syntax and policy visibility.
4. Validate return-path/bounce record if provider requires it.
5. Confirm provider dashboard shows authenticated/verified domain.
6. Confirm sender alignment for `SMTP_FROM` domain.

## 9) Password Reset / Transactional Email Smoke Checklist
1. Run non-secret env presence check (configured/missing only).
2. Trigger password reset request for approved test account.
3. Confirm provider acceptance event for test send.
4. Confirm recipient inbox/junk placement and link usability.
5. Confirm no secret value appears in app logs, proofs, or screenshots.
6. Run admin mail diagnostics test endpoint (approved test recipient only).
7. Confirm failure paths produce non-leaking, generic user response.

## 10) Rollback Plan
If production email rollout degrades:
1. Disable production send path and revert to safe fallback posture.
2. Revert last SMTP credential set in secret store.
3. Re-check auth/password reset endpoints for non-leaking behavior.
4. Document incident timeline and remediation evidence.
5. Keep public launch as NOT_READY until re-validation passes.

## 11) No-Secret-Printing Policy
- Never print secret values in terminal output, docs, logs, or proof bundles.
- Use only state reporting: `PRESENT` / `MISSING` / `VERIFIED`.
- Never commit `.env` files or provider credentials.
- Manual dashboard entry only for production values.

## 12) Go/No-Go Checklist
Go only if all are true:
- Provider selected and sending domain verified.
- SPF, DKIM, DMARC, and bounce records verified.
- Required env contract present in production secret store.
- Secret rotation completed with evidence.
- Password reset and transactional email smoke PASS.
- No secret exposure incident.

Otherwise: NO-GO.

## 13) Public Launch Status
Public launch remains NOT_READY until this checklist is fully complete.

## 14) Controlled Beta Status
Controlled beta remains READY_FOR_CONTROLLED_BETA_CONTINUATION.

## 15) Next Owner Actions
1. Confirm production mail provider decision.
2. Apply DNS records manually in DNS provider.
3. Enter/rotate required secrets in deployment secret store.
4. Execute safe smoke checklist with approved test recipients.
5. Attach evidence links and final gate decision to action board.

---

Guardrails:
- This runbook does not configure production SMTP.
- This runbook does not rotate secrets.
- This runbook does not mutate DNS.
- Actual values must be entered manually in provider dashboards/secret stores.
- Public launch remains NOT_READY until all checks pass.
