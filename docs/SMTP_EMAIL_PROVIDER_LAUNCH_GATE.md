# SMTP EMAIL PROVIDER LAUNCH GATE

## Purpose
Define production launch requirements for SMTP/email delivery readiness without storing secrets.

## Provider Selection
- Selected provider: CONFIG_REQUIRED (set before launch)
- Provider account owner role: Platform Operations Lead

## Required Environment Variables
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- SMTP_FROM
- SMTP_SECURE
- NOTIFY_SMTP_HOST
- NOTIFY_SMTP_PORT
- NOTIFY_SMTP_USER
- NOTIFY_SMTP_PASS
- NOTIFY_EMAIL_FROM

## Sender Requirements
- Verified sender/from address is mandatory
- Reply-to/support address must be configured for user-facing communications

## Mode Separation
- Test mode: sandbox domain/accounts only
- Production mode: verified production sender/domain only
- No test credentials in production runtime

## Domain Authentication
- SPF required
- DKIM required
- DMARC required
- Launch blocked until DNS auth checks are completed and recorded

## Bounce and Complaint Handling
- Define mailbox/webhook processing path for bounces and complaints
- Escalate repeated delivery failures to operations owner

## Rate Limit Expectations
- Respect provider sending limits
- Apply backoff/retry strategy for transient failures

## Transactional Email Categories
- login/security notifications (if enabled)
- payment/credit receipt notices
- report-ready notifications
- admin notifications
- support/contact acknowledgements

## Launch Gate Criteria
- Provider selected and approved
- Required env vars present in deployment secret store
- Sender domain authenticated (SPF/DKIM/DMARC)
- Bounce/complaint handling path validated
- Dry-run deliverability check evidence recorded

## Security
- No real SMTP secrets in repository
- Secrets must be managed only in secure secret stores
