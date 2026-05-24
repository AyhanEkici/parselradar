# PRODUCTION EMAIL EXECUTION INPUT TEMPLATE

Use this template to collect required manual inputs before running production SMTP/DNS/secret execution.

Important:
- Do not paste secret values into this file.
- Use placeholders for non-secret fields.
- Use yes/no for secret presence only.

## 1) Provider And Sender Identity
- mail provider: <PROVIDER_NAME_OR_PENDING>
- sending domain: <SENDING_DOMAIN>
- sender email: <SENDER_EMAIL>
- from name: <FROM_NAME>
- reply-to email: <REPLY_TO_EMAIL>

## 2) SMTP Connection Metadata (No Secrets)
- SMTP host: <SMTP_HOST>
- SMTP port: <SMTP_PORT>
- SMTP secure true/false: <true_or_false>
- SMTP username present: <yes_or_no>
- SMTP password present: <yes_or_no>

## 3) DNS Inputs
- SPF record copied from provider: <yes_or_no>
- DKIM record copied from provider: <yes_or_no>
- DMARC policy chosen: <DMARC_POLICY_VALUE>
- DNS provider: <DNS_PROVIDER_NAME>

## 4) Deployment Targets
- Railway/Vercel env target: <RAILWAY_OR_VERCEL_TARGET>
- production CLIENT_URL present: <yes_or_no>
- production API_URL present: <yes_or_no>

## 5) Safe Smoke And Rollback Ownership
- test recipient: <APPROVED_INTERNAL_TEST_RECIPIENT>
- rollback contact: <ROLLBACK_OWNER_CONTACT>

## 6) Final Pre-Execution Check
- provider selected: <yes_or_no>
- sender identity complete: <yes_or_no>
- DNS records prepared: <yes_or_no>
- secret presence confirmed in secret store: <yes_or_no>
- ready to execute manual runbook: <yes_or_no>

---

Policy:
- This template does not configure production SMTP.
- This template does not modify DNS.
- This template does not rotate secrets.
- Manual dashboard changes are required outside the repository.
