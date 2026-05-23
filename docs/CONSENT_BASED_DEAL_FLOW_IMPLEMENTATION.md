# CONSENT BASED DEAL FLOW IMPLEMENTATION

## Purpose
This phase establishes a safe foundation for future professional matching without creating a marketplace or external sharing pipeline.

## Implemented Consent Fields
Property-level fields introduced:
- dealFlowConsentStatus: NOT_ASKED | DECLINED | OPTED_IN
- dealFlowConsentAt: optional timestamp
- dealFlowConsentScope: optional string array
- professionalContactAllowed: boolean

## User Copy Principles
User copy in property creation follows these rules:
- optional and explicit
- no hidden backdoor data use
- default is private (unchecked)
- no opt-in required to create a property

## Admin Visibility
Admin surfaces now display:
- Deal-flow consent status (Opted in / Declined / Not asked)
- Professional contact permission (Allowed / Not allowed)

Visibility is informational for governance and moderation only.

## User Property Visibility
Property detail shows current sharing state:
- Deal-flow sharing status
- Professional contact status
- "You can keep this private. Sharing is optional."

Current phase is read-only visibility for consent state in property detail.

## What Is Not Implemented Yet
Not implemented in this phase:
- external data sharing
- automated marketplace routing
- professional matching engine
- hidden background distribution of user cases

## Guardrails
- No hidden data use.
- No external sharing yet.
- No fake official-proof claims.
- No public-launch-ready claims.

## Future Marketplace Requirements
Before any real matching or sharing rollout:
1. explicit consent revision/withdrawal UX
2. auditable sharing logs per property case
3. strict recipient policy and scope controls
4. legal/compliance review for outbound sharing
5. operational controls for consent enforcement and incident response
