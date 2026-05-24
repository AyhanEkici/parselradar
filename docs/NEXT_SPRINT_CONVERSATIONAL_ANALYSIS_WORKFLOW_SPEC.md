# Next Sprint Conversational Analysis Workflow Spec

## 1) Goal
Design a guided conversational workflow so a user can create a useful analysis/report through a chat-like interaction, while preserving current trust boundaries.

## 2) Problem Statement
Current real feedback indicates users understand value but expect a Google-search/chat-like flow instead of tab-heavy navigation.

## 3) Scope (Planning + Spec)
- In scope:
  - Conversation-first workflow design
  - UX copy and decision prompts
  - Mapping from conversational inputs to current report structure
  - Guardrails for guidance-only and non-official boundaries
- Out of scope:
  - Full backend/runtime implementation
  - OCR runtime activation
  - External official-data automation

## 4) Input Model (Conversational)
- Required core inputs:
  - ada
  - parsel
  - location (il/ilce/mahalle or equivalent)
  - m2
- Optional enrichments:
  - listing price
  - price per m2
  - source notes
  - uploaded files (future flow with explicit deferred OCR status)

## 5) Suggested User Journey
1. User opens a single conversational entry point.
2. System asks minimal high-signal questions (ada/parsel/location/m2).
3. System confirms interpreted inputs before generating analysis state.
4. System presents a structured summary with what is known vs missing.
5. System guides user to add missing evidence and optional uploads.
6. System produces guidance-only report with explicit trust boundaries.

## 6) Conversation Design Rules
- Keep prompts short and concrete.
- Show progress state (completed inputs vs missing inputs).
- Always separate "known", "inferred", and "missing" data.
- Never imply official verification or legal certainty.

## 7) Trust and Policy Constraints
- Must display:
  - Guidance only
  - Manual review required
  - Not official verification
- Must not display:
  - official verification claims
  - valuation certainty claims
  - buy/sell advice
  - TKGM/e-Imar/e-Devlet automation claims

## 8) UI/UX Clarity Requirements
- Explain role of `Yeni Mülk` in plain language.
- Explain whether tabs are optional, auto-filled, or required.
- Prefer a single primary flow with tabs as secondary drill-down.

## 9) OCR Path Positioning (Deferred)
- Upload path can be shown in workflow explanation.
- OCR runtime remains deferred.
- Any OCR step must be labeled planned/non-active until implemented and validated.

## 10) Acceptance Criteria (Spec Phase)
1. Conversational flow covers first-time user path end-to-end on paper/spec.
2. Input-to-report mapping is explicit and testable.
3. Trust-safe wording is embedded in every output step.
4. Tab role and `Yeni Mülk` behavior are understandable in one read.
5. No runtime overclaim introduced.

## 11) Proposed Deliverables
- Conversation prompt tree (v1)
- Screen/state map for guided flow
- Copy deck for trust-safe prompts and boundaries
- Implementation slicing proposal (MVP -> v1.1)

## 12) Priority and Sequence
- Priority: PRIMARY_NEXT_SPRINT
- Sequence:
  1. finalize conversational spec
  2. align with existing report semantics
  3. implement minimal guided flow slice
  4. validate with next real viewer feedback
