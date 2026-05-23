# PROFESSIONAL DEAL-FLOW DASHBOARD

## Purpose
Provide an internal admin shell to review consent-based property intake for a future professional workflow.

## Current Status
- Internal admin preview only
- Route: /admin/deal-flow
- Public launch readiness: NOT_READY

## Consent Requirements
A case is considered deal-flow eligible only when consent is explicit:
- dealFlowConsentStatus = OPTED_IN
- professionalContactAllowed = true for future contact pathways

No hidden data routing is allowed.

## What Appears In Dashboard
For each property (based on current endpoint availability):
- property and location
- user display context
- asset type
- asking price and area (if available)
- consent status and consent timestamp
- professional contact permission
- evidence/readiness signal (available/partial/missing)
- missing evidence status
- market signal / TKGM evidence status (if available)
- analysis runs count
- action links:
  - Open Property
  - Documents
  - Result/Report
  - Admin Analysis Registry

Summary cards include:
- Total opt-in cases
- Contact allowed
- Needs evidence
- Ready for review
- Missing consent / not eligible

## Not Implemented Yet
This phase does not implement:
- external sharing
- lead transfer to professionals
- professional account onboarding
- marketplace automation
- payment flow changes
- OCR/scraping automation
- TKGM/TUCBS/CSB automation

## Boundary Rules
- No hidden data use.
- No external sharing active.
- No marketplace claim.
- No official legal, valuation, tapu, cadastral, municipality, or zoning proof claim.

## Future Professional Workspace Requirements
Before real professional matching:
1. Explicit consent scope revision and withdrawal UX
2. Recipient policy enforcement and case-level scope checks
3. Auditable outbound sharing logs and review controls
4. Professional intake queue with strict permission boundaries
5. Incident response and compliance controls for data handling

## Future Monetization Options
Potential controlled options after policy and compliance readiness:
- pro subscription
- lead review workflow
- professional review request workflow
- opt-in deal matching pipeline
