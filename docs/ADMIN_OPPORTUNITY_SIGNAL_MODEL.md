# ADMIN OPPORTUNITY SIGNAL MODEL

## Purpose
Define internal-only admin opportunity signals that may use consent state, evidence coverage, and future OCR-assisted suggestions for triage.

Current phase status:
- internal-only model definition
- not user-facing buy advice
- not official valuation
- not legal/tapu/imar proof
- external sharing remains disabled

## Internal Labels
Admin-only opportunity labels:
- BUY_CANDIDATE_INTERNAL
- WATCHLIST
- REVIEW_WITH_PROFESSIONAL
- NEEDS_MORE_EVIDENCE
- LOW_INFORMATION
- RED_FLAG_REVIEW

## Guardrails
These labels must always follow these rules:
- admin-only
- internal triage signal only
- not shown as buy advice to users
- not official valuation
- not legal/imar/tapu proof
- must consider consent before professional sharing
- external sharing remains disabled

## Deterministic Inputs
Suggested inputs for future signal calculation:
- consent status
- professional contact permission
- ada/parsel present
- TKGM evidence present
- municipality/e-Imar evidence present
- price/m2 present
- market signal present
- evidence conflicts
- missing critical documents
- OCR confidence

OCR note:
- OCR extracted text may later feed admin-only internal triage features.
- OCR-derived signals must remain explainable, reviewable, and manually overridable.

## Suggested Meaning
- BUY_CANDIDATE_INTERNAL: strong internal opportunity pattern, still requires human review and no user-facing buy claim
- WATCHLIST: promising but incomplete case worth monitoring
- REVIEW_WITH_PROFESSIONAL: internal signal that a consented case may justify later professional review preparation
- NEEDS_MORE_EVIDENCE: evidence gaps block meaningful triage
- LOW_INFORMATION: too little reliable context for opportunity assessment
- RED_FLAG_REVIEW: conflicting, suspicious, or high-risk evidence state requiring manual review

## Consent and Sharing Rules
Even if a signal is strong:
- no external sharing is allowed in this phase
- no marketplace routing is allowed in this phase
- professional review preparation must remain internal unless future consent and policy controls are implemented
- consent must be explicit before any later sharing workflow is considered

## Example Internal Logic
Possible future logic may consider:
- evidence completeness
- source diversity
- OCR-extracted parcel identity fields
- market signal presence
- conflict detection across uploaded evidence
- missing municipality or tapu context

Signal outputs should stay explainable and reviewable.

## Current Implementation Decision
This phase defines the signal model only.
Live admin opportunity scoring based on OCR is not active yet.
`BUY_CANDIDATE_INTERNAL` / `WATCHLIST` runtime activation is not enabled in this phase unless explicitly implemented in a later scoped change.