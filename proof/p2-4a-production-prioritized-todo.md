# P2.4A Production Prioritized TODO

- readinessScore: 87
- launchRecommendation: INTERNAL_ALPHA_READY

## production blockers
- none

## pre-launch requirements
- BKP-001: define concrete database backup RPO/RTO and ownership
- BKP-002: define document/file backup and tested restore path
- OPS-002: gate production launch on SMTP/email provider readiness

## security/auth hardening
- expand rate-limit coverage for sensitive admin/auth endpoints
- keep cross-user isolation assertions in CI smoke gate

## payment/credit hardening
- add CI guard for Stripe test/live key separation
- preserve webhook idempotency and completed-event-only credit fulfillment

## document/evidence hardening
- add retention/deletion SOP for sensitive evidence documents
- add malware/content scanning hardening to upload path

## error/loading/empty state gaps
- standardize explicit empty-state messaging for diagnostics/evidence surfaces

## observability/monitoring gaps
- document log retention and alert routing policy
- keep deployment-truth and runtime diagnostics in release gate

## backup/recovery gaps
- publish restore drill runbook with cadence and success criteria

## operational/admin gaps
- create incident response playbook with severity and communication matrix
- define support/debug access boundaries and approval workflow

## future non-MVP items
- AI/chat remains out of scope unless explicitly planned
- connector expansion remains governed and off by default

## policy guard
- connector activation not promoted to P0/P1
- AI chat not promoted to P0/P1
- scraping not promoted to P0/P1
