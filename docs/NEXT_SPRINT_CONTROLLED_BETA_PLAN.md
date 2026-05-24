# Next Sprint Controlled Beta Plan

## 1) Sprint Objective
Create a real-feedback-driven iteration sprint that strengthens controlled-beta clarity and prioritization without speculative feature expansion.

## 2) Recommended Focus
- Primary focus: run Viewer #2 targeted feedback session and capture actionable findings.
- Secondary focus: prep provider-selection decision path only if public-launch preparation is actively scheduled.

## 3) What NOT To Work On Yet
- No OCR runtime implementation.
- No historical metadata backfill writes/migrations.
- No speculative new feature surfaces without real viewer demand.
- No unauthorized official-data automation claims.

## 4) Top 5 Next Actions
1. Execute Viewer #2 session with targeted questions and structured capture.
2. Convert Viewer #2 feedback into issue entries with severity and owner.
3. Prioritize quick trust/clarity polish items that reduce confusion.
4. Decide whether public-launch preparation is in scope this sprint.
5. If yes, request founder provider choice and complete email/DNS/secret execution inputs.

## 5) External Input Needed
- Real Viewer #2 responses (required)
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
- Primary: Run Viewer #2 with targeted questions.
- Secondary: Choose production email provider only if moving toward public launch.
- Avoid: more speculative feature building before feedback.
