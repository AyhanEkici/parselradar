# REAL DATA CONNECTOR ROADMAP

## 1. Executive Summary
- ParselRadar can continue controlled beta with a manual-evidence model, but real-data connector claims must remain narrow, auditable, and legally defensible.
- The first property audit shows the biggest trust gap is not UI absence; it is missing verified public municipality sources and missing manually uploaded TKGM evidence.
- The safest first connector work is source-registry expansion and assisted manual evidence capture, not automated scraping or speculative endpoint activation.
- Public launch remains `NOT_READY`.

## 2. Current Truth State
- First property id: `6a09317e90f79b455480b80e`
- Location: `Kayseri / Kayseri`
- TKGM: `MANUAL_EVIDENCE_ONLY`
- Kayseri / e-Imar: `REGISTRY_FOUNDATION_ONLY`
- CSB / TUCBS / OGC / GIS: `NOT_CONFIGURED`
- OCR: `DEFERRED`
- Map / layer: `PREVIEW_ONLY`
- Controlled beta: `READY_FOR_CONTROLLED_BETA_CONTINUATION`
- Public launch: `NOT_READY`
- Connector enrichment strength from first-property audit: low
- Report usefulness from first-property audit: medium
- Opportunity readiness from first-property audit: not trusted yet

## 3. Connector Candidate Matrix

| Candidate | Current purpose | LEGAL_STATUS | TECH_STATUS | PRODUCT_VALUE | RISK | Implementation posture |
| --- | --- | --- | --- | --- | --- | --- |
| 1. TKGM Parsel Sorgu manual evidence flow | User/admin manually opens official public site and uploads screenshots or exported evidence | `MANUAL_EVIDENCE_ONLY` | `READY_FOR_IMPLEMENTATION` | `HIGH` | `LOW` | Safe to improve guidance, evidence typing, and report recognition without scraping |
| 2. TKGM Parsel Sorgu assisted browser walkthrough | Product opens official public URL and guides user/admin through visible public steps only | `MANUAL_EVIDENCE_ONLY` | `READY_FOR_IMPLEMENTATION` | `HIGH` | `LOW` | Allowed only as human-guided navigation with no CAPTCHA/login/session automation |
| 3. TKGM price-history evidence capture | User/admin manually captures visible official price-history evidence where lawfully accessible | `MANUAL_EVIDENCE_ONLY` | `READY_FOR_IMPLEMENTATION` | `HIGH` | `MEDIUM` | Manual upload and evidence labeling are acceptable; automated extraction is not |
| 4. Kayseri Buyuksehir / district e-Imar public source | Verify exact official municipality zoning source URLs and use them for manual guidance | `SAFE_PUBLIC` | `NEEDS_SOURCE_VERIFICATION` | `HIGH` | `LOW` | Verify each official public URL first; registry-only guidance before any automation |
| 5. CSB / TUCBS open public OGC services | Use stable official public GetCapabilities endpoints for read-only layer metadata | `PERMISSION_REQUIRED` | `NEEDS_OFFICIAL_APPROVAL` | `MEDIUM` | `HIGH` | Public claims must stay blocked until official rights, stable endpoints, and proofs exist |
| 6. UCBP / official access flow | Manual portal review to determine access model, approval path, and visible services | `BLOCKED_BY_AUTH` | `NEEDS_OFFICIAL_APPROVAL` | `MEDIUM` | `HIGH` | Manual evidence/checklist only; no automation through e-Devlet or protected sessions |
| 7. Municipality source registry expansion | Expand verified public municipality source records for manual source guidance | `SAFE_PUBLIC` | `READY_FOR_IMPLEMENTATION` | `HIGH` | `LOW` | Best immediate trust gain if each URL is manually verified and recorded |
| 8. OCR-assisted document classification | Extract suggestion text locally and require manual confirmation before use | `SAFE_PUBLIC` | `DEFERRED` | `MEDIUM` | `MEDIUM` | Only after runtime/dependency decision; suggestion-only, never official verification |
| 9. Admin-only opportunity signal model | Internal evidence sufficiency and readiness classification for admins only | `SAFE_PUBLIC` | `READY_FOR_IMPLEMENTATION` | `MEDIUM` | `MEDIUM` | Keep strictly non-user-facing and evidence-threshold based; no buy advice |
| 10. Map/layer catalog activation | Show read-only layer metadata and overlays when proven public or approved sources exist | `PERMISSION_REQUIRED` | `NOT_CONFIGURED` | `MEDIUM` | `HIGH` | Do not activate real layers without endpoint proof, rights proof, and diagnostics proof |

## 4. Legal and Safety Rules
- Only connect to sources that are either clearly public and manually verified or officially approved for platform use.
- A public page being reachable does not create a right to scrape, automate, or treat its output as official proof.
- Personal session access, e-Devlet access, or firm-only portal visibility does not authorize platform connector activation.
- Official source guidance must never be phrased as official zoning proof, cadastral proof, valuation proof, or buy advice.
- Connector activation requires legal review, endpoint verification, technical diagnostics, and auditable activation proof.
- Unknown, copied, guessed, or community-posted URLs and endpoints are not acceptable inputs for registry or connector activation.
- No connector may depend on hidden/private endpoints, credential reuse, browser session theft, token copying, or user login replay.

## 5. Safe Public Website Walkthrough Rules

### Allowed
- Open public URLs.
- Close ordinary cookie banners.
- Close public announcement or terms popups.
- Click visible public tabs and buttons.
- Guide user/admin to capture and upload screenshots or supporting evidence.
- Record that a public site is reachable, blocked, gated, or requires manual interaction.
- Record visible barriers such as login, CAPTCHA, e-Devlet, rate limits, or authorization forms.

### Forbidden
- CAPTCHA bypass.
- Login bypass.
- e-Devlet automation.
- TKGM protected-session scraping.
- Hidden or private endpoint use.
- Rate-limit evasion.
- Fake official proof.
- Unattended scraping at scale.
- Token, cookie, or bearer-session reuse.
- Any claim that manual public viewing equals official verification.

## 6. First-Property Impact Analysis
- The first-property report is currently weakened most by missing municipality source guidance and missing TKGM evidence uploads, not by missing high-complexity GIS automation.
- Adding verified Kayseri municipality registry entries would immediately improve source guidance quality and reduce `NOT_CONFIGURED` gaps for the selected property.
- Improving TKGM assisted evidence capture would directly address missing parcel and price-history evidence for the selected property without introducing scraping risk.
- TUCBS/OGC staging has future strategic value, but it does not solve the first-property trust gap until official endpoints are verified and legally usable.
- OCR can help document triage later, but it does not fix legal-source truth or official-evidence gaps for the first property.
- Admin-only opportunity signals should remain downstream of evidence sufficiency, not upstream of it.

## 7. Recommended Connector Priority

### Ranking
1. `P2.CONNECTOR-2A - Municipality Source Registry Expansion for Kayseri`
2. `P2.CONNECTOR-2B - TKGM Assisted Evidence Capture UX`
3. `P2.CONNECTOR-2C - TUCBS/OGC Staging Governance`
4. `P2.CONNECTOR-2D - OCR POC Decision`

### Why this order
- Lowest risk first: verified public municipality source records and assisted manual evidence capture do not require scraping, credentials, or protected automation.
- Highest trust value first: the first-property report specifically needs Kayseri municipality source guidance and TKGM evidence support.
- No legal or permission dependency first: registry expansion and manual-evidence UX can ship without official API approval.
- Controlled beta testability: both first phases can be exercised safely in controlled beta with explicit disclaimers and auditability.

### Candidate evaluation
- A. Municipality Source Registry Expansion: best next step because it improves real report guidance immediately and remains within public/manual verification boundaries.
- B. TKGM Assisted Evidence Capture: second because it adds direct evidence value for reports while preserving manual control and legal safety.
- C. TUCBS/OGC Open Endpoint Staging: third because it should remain staging-only until stable official public endpoints and usage rights are proven.
- D. OCR POC: defer because runtime/dependency choice is still intentionally deferred and it does not solve the most urgent trust gap first.

## 8. Proposed Implementation Phases

### P2.CONNECTOR-2A - Municipality Source Registry Expansion for Kayseri
- Goal: verify official public Kayseri municipality or district zoning/e-Imar/e-Plan URLs and add registry records only after proof.
- Scope:
  - Check Kayseri Buyuksehir and relevant district municipality public zoning sources.
  - Confirm official domain, public accessibility, and page purpose.
  - Record province, district, source type, exact URL, review date, and reviewer/admin initials.
  - Update report/source guidance to use verified entries where present.
- Exclusions:
  - No scraping.
  - No auto-discovery crawler.
  - No guessed or invented URLs.

### P2.CONNECTOR-2B - TKGM Assisted Evidence Capture UX
- Goal: improve manual TKGM evidence collection without automating protected behavior.
- Scope:
  - Open official TKGM public URL from the app.
  - Show human-readable steps for parcel lookup and screenshot capture.
  - Support upload with evidence-type auto-suggestion from upload context only.
  - Recognize TKGM parcel screenshot and TKGM price-history screenshot as distinct evidence classes.
- Exclusions:
  - No scraping.
  - No CAPTCHA bypass.
  - No session replay.
  - No automatic data extraction from protected flows.

### P2.CONNECTOR-2C - TUCBS/OGC Staging Governance
- Goal: keep read-only geospatial connector work truthful, staged, and auditable.
- Scope:
  - Re-run GetCapabilities checks only against officially sourced candidate endpoints.
  - Keep state at `NOT_CONFIGURED` or `READY_FOR_MANUAL_REVIEW` unless public stability and legal use are proven.
  - Record diagnostics and governance evidence for each candidate.
  - Do not expose fake layers or pretend live connectivity.
- Exclusions:
  - No activation without official proof.
  - No production use of test-only endpoints.
  - No endpoint guessing.

### P2.CONNECTOR-2D - OCR POC Decision
- Goal: decide whether a local OCR proof-of-concept is worthwhile and safe.
- Scope:
  - Compare browser-local versus server-local OCR tradeoffs.
  - Keep any future OCR as preview-only extracted text.
  - Require manual confirmation before any metadata use.
- Exclusions:
  - No external OCR API.
  - No official verification claim.
  - No automated evidence truth assignment.

### P2.CONNECTOR-2E - Admin-Only Opportunity Signals v2
- Goal: improve admin-only evidence sufficiency and review classification without introducing investment advice.
- Scope:
  - Base signal states on evidence thresholds and connector truth state.
  - Allow `WATCH` and `REVIEW` only when evidence thresholds are met.
  - Keep user-facing buy advice out of scope.
- Exclusions:
  - No user-facing opportunity recommendation.
  - No valuation proof claim.
  - No signal promotion from sparse/manual-only evidence alone.

## 9. Acceptance Criteria Per Phase

### P2.CONNECTOR-2A acceptance criteria
- At least one Kayseri-related municipality source is verified on an official public domain before registry addition.
- Every added record includes exact URL, source type, review date, and reviewer/admin initials.
- Unverified districts remain `NOT_CONFIGURED`.
- UI wording stays guidance-only and does not imply official zoning proof.

### P2.CONNECTOR-2B acceptance criteria
- TKGM guidance opens only the official public URL.
- UI clearly states manual evidence capture is required.
- Uploaded TKGM evidence types can be distinguished in the report workflow.
- No automated protected-session behavior is introduced.

### P2.CONNECTOR-2C acceptance criteria
- Candidate endpoints come only from official public documentation or explicit approval.
- GetCapabilities diagnostics proof is stored for each tested candidate.
- Any unstable, unverified, or legally unclear endpoint remains non-active.
- Admin UI wording stays honest about `NOT_CONFIGURED`, `READY_FOR_MANUAL_REVIEW`, or approval-required state.

### P2.CONNECTOR-2D acceptance criteria
- OCR runtime decision is documented before dependency installation.
- Any POC is labeled preview-only and manual-confirmation-required.
- No external OCR network call is used.
- Web/API builds remain stable with the chosen gating strategy.

### P2.CONNECTOR-2E acceptance criteria
- Signal states are derived from explicit evidence sufficiency thresholds.
- Admin-only restriction is preserved.
- No user-facing buy advice, official verification, or valuation-proof wording is added.
- Low-evidence properties stay below actionable signal thresholds.

## 10. Non-Goals
- No TKGM scraping or protected-session automation.
- No CAPTCHA, login, or e-Devlet bypass.
- No invented Kayseri municipality URLs.
- No invented CSB/TUCBS/OGC endpoints.
- No automatic official verification claim.
- No valuation proof claim.
- No buy-advice product behavior.
- No connector activation based only on personal account visibility.
- No `.env` mutation in this phase.
- No backend/API/auth/payment logic change in this phase.

## 11. Controlled Beta and Launch Posture
- Controlled beta can continue with the current manual-evidence model and explicit source/evidence gaps.
- Public launch remains `NOT_READY` until real-data connectors are lawfully verified, technically proven, and governance-approved where required.

## 12. Recommended Immediate Execution Boundary
- Implement first: `P2.CONNECTOR-2A - Municipality Source Registry Expansion for Kayseri`.
- Implement second: `P2.CONNECTOR-2B - TKGM Assisted Evidence Capture UX`.
- Keep TUCBS/UCBP/OGC in governance and staging review until official access and endpoint proof exist.
- Keep OCR deferred until dependency/runtime decision is explicitly approved.