# Real Viewer Product Decision Matrix

## 1) Continue / Improve / Pause Decision
- Decision: CONTINUE_CONTROLLED_BETA_WITH_PRODUCT_FLOW_HARDENING

## 2) Top Feedback-Backed Insight
- Viewer understands report value but expects a conversational, chat-like analysis workflow instead of tab-heavy navigation.

## 3) Top 5 Product Priorities
1. CONVERSATIONAL_ANALYSIS_WORKFLOW (highest priority)
2. Clarify whether `Yeni Mülk` auto-fills downstream workflow state
3. Reduce tab-first dependency for first-time users
4. Make upload -> OCR/storage/output journey visible as a guided path (without claiming active OCR runtime)
5. Capture missing trust-answer data in next viewer session

## 4) What Should Be Built Before Next Strong Demo
- Guided conversational intake/report flow spec and UX direction
- Explicit UI copy for tab purpose and `Yeni Mülk` relationship
- Step-by-step path visibility from property context to report output

## 5) What Can Wait
- OCR runtime implementation
- Historical metadata mutation/backfill execution
- Broader speculative feature expansion not backed by real user feedback

## 6) What Remains Public-Launch Blocking
- Production SMTP/DNS/secret execution path incomplete
- Historical metadata backfill still deferred (quality-threshold dependent)
- Any official-data claim expansion remains permission/approval dependent

## 7) What Is Controlled-Beta Acceptable
- Guidance-only report posture
- Manual evidence boundaries
- Deferred OCR runtime with clear non-active wording
- Deferred mutation/backfill writes

## 8) What Not To Build Yet
- Full chat agent runtime without scoped MVP and trust-copy guards
- OCR activation claims or runtime behavior
- Automation claims for TKGM/e-Imar/e-Devlet paths

## 9) Next Sprint Recommendation
- Primary: CONVERSATIONAL_ANALYSIS_WORKFLOW
- Secondary: tab clarity and `Yeni Mülk` explanation
- Later: upload/OCR prototype only after trust-safe scope approval
