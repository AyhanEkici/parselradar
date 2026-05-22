# Connector Activation Governance

## Activation Gates
A connector may only move toward ACTIVE after all gates pass:
- source authority known
- legal right to use
- endpoint verified
- credentials or token verified if required
- static IP verified if required
- GetCapabilities pass
- layer inventory recorded
- rate limit and usage terms known
- admin activation decision recorded
- rollback path available

## Forbidden Activation
Do not activate when any of the following is true:
- test-only endpoints in production
- unknown source endpoints
- endpoints copied from random websites
- endpoints without legal review
- endpoints that only work from personal e-Devlet session
- endpoints requiring user credentials
- endpoints that fail GetCapabilities

## Proof Required Before ACTIVE
Required artifacts before ACTIVE:
- connector-readiness-proof.json
- connector-capabilities-proof.json
- legal-approval-reference.md
- admin-activation-record.json

## Governance Principle
No connector is activated by convenience. Activation is a legal, technical, and auditable decision.
