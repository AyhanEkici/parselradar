# Next Sprint Controlled Beta Plan

## 1) Sprint Objective
Create a real-feedback-driven sprint centered on a guided conversational analysis workflow, while preserving trust-safe controlled-beta boundaries.

## 2) Recommended Focus
- Primary focus: design and sequence a guided conversational analysis workflow (chat-like intake to report path).
- Secondary focus: improve tab/navigation clarity (especially `Yeni Mulk` behavior and whether tabs are required).
- Tertiary focus: plan upload-to-output transparency path; keep OCR runtime deferred.

## 3) What NOT To Work On Yet
- No OCR runtime implementation.
- No historical metadata backfill writes/migrations.
- No speculative new feature surfaces without real viewer demand.
- No unauthorized official-data automation claims.

## 4) Top 5 Next Actions
1. Finalize `docs/NEXT_SPRINT_CONVERSATIONAL_ANALYSIS_WORKFLOW_SPEC.md` as the primary execution blueprint.
2. Convert real viewer feedback into prioritized issues and owners (PR-PROD-005/006/007).
3. Define a minimal conversation-first UX slice that maps required inputs to report generation.
4. Add explicit copy for tab purpose and `Yeni Mulk` auto-fill behavior.
5. Keep OCR in planned/deferred mode and prepare only trust-safe upload path messaging.

## 5) External Input Needed
- Follow-up trust answer from real viewer (required data gap closure)
- Founder decision on timing for public-launch preparation
- Provider choice if SMTP/DNS/secret execution is to start

## 6) Technical Work Allowed
- Documentation updates
- Trust-copy polish planning
- Read-only verification and audit activities
- Targeted low-risk UX polish that preserves constraints

## 7) Technical Work Postponed
- OCR runtime implementation
- Backfill mutation scripts/migrations
- Provider-dependent production email rollout without explicit founder decision
- Any automation path requiring permissioned external integrations

## 8) Public Launch Blockers
1. Production SMTP/DNS/secret: provider selection + manual execution incomplete.
2. Historical metadata backfill: read-only audit done, mutation deferred.
3. Permissioned TKGM/UCBP strategy: approval/activation remains conditional for official-data claims.

## 9) Success Criteria
- Viewer #2 feedback captured as real, non-synthetic input.
- Prioritized next actions mapped to issues and owners.
- Controlled beta trust boundaries remain unchanged and explicit.
- No new runtime risk introduced.

## 10) Commit/Verification Rules
- Build must pass before and after doc/code changes.
- Restore generated artifacts after each build.
- Stage only scoped files.
- Never stage `.env`, workflow files, or generated outputs.
- Keep commits small, auditable, and phase-specific.

## Recommended Sprint Decision
- Primary: prioritize guided conversational analysis workflow planning/build sequencing.
- Secondary: improve tab clarity and `Yeni Mulk` expectation handling.
- Later: evaluate upload/OCR prototype only after trust-safe scope approval.
