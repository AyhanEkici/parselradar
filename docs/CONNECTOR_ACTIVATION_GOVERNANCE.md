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
- access path authority validated for intended usage scope (individual, company, institution)
- legal entity or partner authority verified when firm-level access is required

## Forbidden Activation
Do not activate when any of the following is true:
- test-only endpoints in production
- unknown source endpoints
- endpoints copied from random websites
- endpoints without legal review
- endpoints that only work from personal e-Devlet session
- endpoints requiring user credentials
- endpoints that fail GetCapabilities
- MERSIS or company-based access requirement is present but no legal entity path is approved
- activation relies only on personal e-Devlet access without platform-level authority

## Proof Required Before ACTIVE
Required artifacts before ACTIVE:
- connector-readiness-proof.json
- connector-capabilities-proof.json
- legal-approval-reference.md
- admin-activation-record.json
- firm or entity authorization proof when company-level access is required
- legal right to use beyond personal portal session

## Governance Principle
No connector is activated by convenience. Activation is a legal, technical, and auditable decision.

## Firm-Level Access Constraint Rule
- Firm-level access requirements (for example MERSIS or personnel authorization) must be reviewed as governance blockers.
- MERSIS or company-based constraints cannot be bypassed by manual login.
- ACTIVE requires legal, entity, and access proof; personal e-Devlet visibility alone is insufficient.
