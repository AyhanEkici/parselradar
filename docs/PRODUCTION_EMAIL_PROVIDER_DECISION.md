# PRODUCTION EMAIL PROVIDER DECISION

## 1) Purpose
Define a safe, non-secret provider-selection and readiness audit for production email launch blocking items.

## 2) Provider Options
Use one of these categories (decision pending):
- Transactional SMTP provider with domain authentication support
- Cloud email API provider with SMTP relay compatibility
- Existing enterprise provider already approved by organization policy

Current decision state:
- PROVIDER_SELECTION_REQUIRED

## 3) Recommended Provider Decision Criteria
1. Reliable deliverability for transactional traffic (password reset first).
2. SPF/DKIM/DMARC onboarding quality and verification tooling.
3. Bounce/suppression visibility and alerting.
4. Role-based access controls and auditability.
5. Operational cost and quota fit for expected volume.
6. Support for verified sender domain alignment.

## 4) Required Production Sender Identity
- Sending domain: required
- Sender email (`SMTP_FROM`): required
- From display name: required
- Reply-to address: recommended
- Sender domain and provider-authenticated domain must align

## 5) Non-Secret Readiness Audit Table
Status values:
- READY
- MISSING
- MANUAL_REQUIRED
- NOT_APPLICABLE
- UNKNOWN

| Item | Status | Notes |
| --- | --- | --- |
| selected mail provider | MISSING | Provider not finalized in current docs. |
| sending domain | MISSING | Domain not finalized for provider onboarding. |
| sender email | MISSING | Production sender identity pending. |
| from name | MISSING | Sender display name pending. |
| reply-to address | MISSING | Reply-to policy pending. |
| bounce/return-path domain | UNKNOWN | Provider-dependent requirement. |
| SPF value known | MISSING | Placeholder-only state in docs. |
| DKIM value known | MISSING | Placeholder-only state in docs. |
| DMARC policy chosen | MANUAL_REQUIRED | Policy value not finalized. |
| production SMTP host known | MISSING | Pending provider selection. |
| production SMTP port known | MISSING | Pending provider selection. |
| SMTP secure mode known | MANUAL_REQUIRED | Pending provider-specific transport mode decision. |
| production SMTP username set | MISSING | Secret-store setup pending. |
| production SMTP password set | MISSING | Secret-store setup pending. |
| production CLIENT_URL set | READY | Present in .env.example (template value). |
| production API_URL set | MANUAL_REQUIRED | .env.example points to localhost; deployed production value must be confirmed manually. |
| password reset smoke recipient chosen | MISSING | Approved internal recipient not selected. |
| rollback owner chosen | MISSING | Rollback owner not assigned. |

## 6) DNS Readiness Checklist
1. SPF record data copied from chosen provider dashboard.
2. DKIM selector/value pairs copied from chosen provider dashboard.
3. DMARC policy selected and approved.
4. Return-path/bounce domain determined (if required by provider).
5. Provider dashboard shows sending domain verification PASS.

## 7) Secret Readiness Checklist
1. `SMTP_USER` presence in production secret store.
2. `SMTP_PASS` presence in production secret store.
3. `SMTP_FROM` presence in production secret store.
4. `JWT_SECRET` rotation plan owner assigned.
5. Rotation execution window approved.
6. Post-rotation smoke owner assigned.

## 8) Manual Dashboard Tasks
1. Choose production provider account and owner.
2. Add sending domain in provider dashboard.
3. Copy DNS records from provider dashboard to DNS operator checklist.
4. Enter SMTP keys in deployment secret stores (no repo storage).
5. Verify provider domain status and suppression/bounce view.

## 9) Pre-Execution Blockers
- Provider selection not finalized.
- Sender identity fields incomplete.
- DNS values not copied from provider dashboard.
- Production SMTP host/port/security mode not confirmed.
- Smoke-test recipient and rollback owner not assigned.

## 10) No-Secret Policy
- Do not print secret values.
- Do not store secrets in repository docs.
- Record only presence/status (`yes/no`, `PRESENT/MISSING`).
- Apply all real values manually in provider and deployment dashboards.

## 11) Go/No-Go Recommendation
- Current recommendation: NO-GO for public launch.
- Gate state: PROVIDER_SELECTION_REQUIRED.
- Public launch remains NOT_READY until provider selection and manual readiness inputs are completed.
