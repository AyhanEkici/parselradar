# LAUNCH INFRASTRUCTURE READINESS

## 1) Current status
- Public launch: NOT_READY
- SMTP: CONFIG_REQUIRED
- DNS: CONFIG_REQUIRED
- Secret rotation: REQUIRED

### Current env presence audit (non-secret, shell-level)
- env presence check completed: yes
- present keys: none
- missing keys (names only):
  - MONGODB_URI
  - JWT_SECRET
  - CLIENT_URL
  - API_URL
  - SMTP_HOST
  - SMTP_PORT
  - SMTP_USER
  - SMTP_PASSWORD
  - SMTP_FROM
  - SMTP_SECURE
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET

### Gate classification after current audit
- SMTP gate: SMTP_CONFIG_REQUIRED
- DNS gate: DNS_CONFIG_REQUIRED (SPF/DKIM/DMARC proof not supplied in this phase)
- secret rotation gate: ROTATION_REQUIRED (no explicit rotation confirmation + no post-rotation smoke verification in this phase)
- public launch gate: NOT_READY

### Next operator action
- Next action is manual deployed environment setup and secret rotation execution via runbook:
  - `docs/DEPLOYED_ENV_AND_SECRET_ROTATION_RUNBOOK.md`
- Important: local shell presence audit does not represent deployed Vercel/production env state.
- Production launch remains `NOT_READY` until deployed env, SMTP/DNS verification, and post-rotation smoke checks pass.

### Current classification
- SMTP status: SMTP_CONFIG_REQUIRED
- Email flow status: EMAIL_FLOW_PARTIAL

### Evidence summary (implementation/state)
- Password reset email flow: implemented (`/auth/forgot-password`, `/auth/reset-password`) with SMTP-gated delivery.
- Admin mail diagnostics + test email: implemented (admin routes exist, delivery is SMTP-gated).
- Notification email flow: partial/stub state (delivery provider reports `stub-email` when env is present; no full production mail transport workflow for notifications).
- Email verification flow: not implemented in current auth flow.
- Production sender domain alignment: CONFIG_REQUIRED.
- SPF/DKIM/DMARC proof in repo: not present as verified PASS evidence.
- Runtime env validation for mail keys: present (`envValidator` + admin/runtime diagnostics).

## 2) SMTP provider requirements
- Provider selection/owner must be approved before launch.
- Sender domain and sender identity must be verified by provider.
- Required runtime env keys (placeholders only in repo):
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_SECURE`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SMTP_FROM`
- Notification channel keys (if used for notification transport path):
  - `NOTIFY_SMTP_HOST`
  - `NOTIFY_SMTP_PORT`
  - `NOTIFY_SMTP_SECURE`
  - `NOTIFY_SMTP_USER`
  - `NOTIFY_SMTP_PASS`
  - `NOTIFY_EMAIL_FROM`
- `from` address must use approved production sender domain.
- Test email flow must validate:
  - password reset send path
  - admin mail-diagnostics test send path
- Bounce/complaint handling path must be defined if provider supports webhooks/mailbox routing.

## 3) DNS requirements
- SPF: REQUIRED
- DKIM: REQUIRED
- DMARC: REQUIRED
- Provider domain verification: REQUIRED
- Sender domain alignment (`From` domain vs authenticated domain): REQUIRED
- Bounce/return-path policy: REQUIRED if provider supports custom return-path.
- Production sender address: REQUIRED (no sandbox sender for production).

### DNS test-record checklist
1. SPF record published and includes provider include mechanism.
2. DKIM selectors published and provider verification returns PASS.
3. DMARC record published with explicit policy and rua/ruf targets per ops policy.
4. Provider dashboard domain verification shows authenticated status.
5. End-to-end deliverability tests pass (inbox placement + no hard-bounce from baseline tests).

## 4) Secret rotation checklist (pre-public-launch)
- MongoDB Atlas app/database user password: ROTATE_REQUIRED.
- Deployed admin account password (including temporary smoke/admin test accounts): ROTATE_REQUIRED.
- JWT/session secret (`JWT_SECRET`): ROTATE_REQUIRED.
- Stripe/payment secrets (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and any live price/webhook material): ROTATE_REQUIRED if configured.
- Live verification/test credentials used in pilot runs: ROTATE_OR_REMOVE_REQUIRED.
- Deployment platform env stores (Vercel/Railway or equivalent): REVIEW_AND_ROTATE_REQUIRED.

## 5) Production readiness gate
Public launch remains blocked until all are true:
1. SMTP provider is configured in secure deployment env.
2. SPF/DKIM/DMARC and provider domain verification are proven.
3. Admin/test credentials are rotated or removed.
4. MongoDB credentials are rotated.
5. Final production-like smoke tests pass (auth, password reset email, admin route protections, payment diagnostics).
6. No claim of public-launch readiness is made before all gate items pass.

## 6) No-secrets policy
- Never commit `.env` files.
- Never print secret values in logs/proof bundles/docs.
- Only presence/state checks (`PRESENT`/`MISSING`, configured/not-configured) are allowed in repository evidence.
- Secret changes must be applied only in approved secret stores and tracked in operational runbooks.

## Later product TODO
Keep scheduled: `P2.UI-BUNDLE-1 Premium black/premium UI redesign` after functional completion.
