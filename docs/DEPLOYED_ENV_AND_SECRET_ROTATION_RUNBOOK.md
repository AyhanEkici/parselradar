# DEPLOYED ENV AND SECRET ROTATION RUNBOOK

## Purpose
Strict manual checklist for deployed environment configuration, SMTP/DNS setup, and secret rotation before any public launch decision.

## 1) Manual prerequisites
Required operator access (manual, out-of-repo):
- Vercel project access
- MongoDB Atlas access
- SMTP provider access
- DNS provider/domain access
- Stripe dashboard access (if Stripe is enabled)

## 2) Secrets to rotate before public launch
Rotate in secure secret stores only. Never commit values.
- `MONGODB_URI` / MongoDB app user password
- `JWT_SECRET`
- `ADMIN_PASSWORD` / deployed admin account password
- `LIVE_VERIFY_ADMIN_PASSWORD` and any pilot/test credentials
- `STRIPE_SECRET_KEY` (if Stripe is enabled)
- `STRIPE_WEBHOOK_SECRET` (if Stripe is enabled)
- `SMTP_PASSWORD`

## 3) Vercel environment variables to configure
Configure in deployment environment scope (Production/Preview as applicable):
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `API_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`
- `SMTP_SECURE`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Notes:
- Runtime currently uses `SMTP_PASS`/`NOTIFY_SMTP_PASS` naming in parts of API email code. If `SMTP_PASSWORD` is chosen as canonical secret name in deployment, map/duplicate to runtime-expected names until naming is unified in a dedicated migration phase.
- Keep sender identity aligned with verified production domain.

## 4) DNS records checklist
Manual provider/domain checks (no fake verification):
- SPF record published and valid
- DKIM selector records published and provider-verified
- DMARC record published with policy and reporting addresses
- Sender domain verification completed in SMTP provider
- Return-path/bounce domain configured (if provider supports custom return-path)

## 5) Verification commands and smoke sequence
Run without printing secret values.

1. Presence-only local/env check:
- `npm run launch:env`
- Output policy: `PRESENT` / `MISSING` only

2. API build check:
- `npm run build --prefix apps/api`

3. Deployed login smoke:
- Verify login route, session establishment, and dashboard access

4. Password reset / email smoke (if implemented):
- Trigger forgot-password flow
- Verify provider accepts send request
- Confirm admin mail diagnostics state is coherent

5. Admin route smoke:
- Verify admin pages load with admin role
- Verify non-admin or logged-out access is blocked

6. Property/report smoke:
- Verify result/report route renders
- Verify no fake official proof/export claims

## 6) No-secrets policy
- Never paste real secret values into docs or git-tracked files.
- Never print raw env values in terminal or proof outputs.
- Only `PRESENT` / `MISSING` checks are allowed for repository evidence.
- Secret changes must be tracked in operations logs, not in source control.

## Launch gate reminder
Public launch remains `NOT_READY` until:
- deployed env secrets are fully configured,
- SMTP and DNS authentication are verified,
- required credential rotations are completed and post-rotation smoke checks pass.

## Later product TODO
Keep scheduled: `P2.UI-BUNDLE-1 Premium black/premium UI redesign` after functional completion.
