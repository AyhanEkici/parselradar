# FIRST KNOWN TESTER PILOT RUN

## Purpose
Prepare and execute the first controlled beta pilot run for a small known-tester cohort while preserving existing launch guardrails.

## Pilot Scope
- 1-3 known testers only
- No public advertising
- Admin supervision required
- Known tester pilot status: READY_FOR_KNOWN_TESTERS

## Current Release State
- User-flow status: CONTROLLED_BETA_CANDIDATE
- Admin access status: VERIFIED
- Public launch status: NOT_READY
- Email provider readiness: CONFIG_REQUIRED
- SPF/DKIM/DMARC status: CONFIG_REQUIRED
- Database backup restore readiness: PASS
- Document/file restore readiness: PASS

## Tester Journey
1. Register/login
2. Create Yeni Mulk
3. Upload evidence
4. Inspect readiness
5. Run analysis buttons
6. Check report readiness
7. Report bugs

## Admin Journey
1. Login as admin
2. Open /admin/cms
3. Inspect users/properties/evidence
4. Verify no normal-user admin access
5. Record issues

## Beta Limitations
- Email provider: CONFIG_REQUIRED
- Public launch: NOT_READY
- CSV is preview-only
- Evidence is supporting information only
- No official legal/tapu/imar proof

## Go/No-Go Exit Criteria
Go:
- No open P0_BLOCKER findings
- No open P1_FLOW_BLOCKER findings on core tester journey
- Admin-only access controls remain enforced
- Findings are recorded in the issue ledger with owners and target fix phases

No-Go:
- Any unresolved P0_BLOCKER exists
- Reproducible P1_FLOW_BLOCKER prevents main tester journey completion
- Any normal-user path reaches admin-only capabilities
- Any communication introduces public-launch-ready or official-proof overclaim

## Operational Guardrails
- Public launch remains blocked until SMTP provider and SPF/DKIM/DMARC requirements are fully completed and verified.
- MongoDB password and temporary admin password rotation are required before public launch.
- Do not store credentials or operational secrets in repository files.
