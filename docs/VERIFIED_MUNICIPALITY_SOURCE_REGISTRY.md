# VERIFIED MUNICIPALITY SOURCE REGISTRY

## Purpose
Create a safe foundation for municipality/e-Imar/e-Plan/imar-durumu source guidance so users can be directed to manually reviewed official sources without fake URLs, scraping, or automation.

## What Counts As A Verified Official Source
A source can be marked verified only when all checks are complete:
- Official municipality domain or officially delegated municipality service domain.
- Page purpose clearly matches zoning inquiry, e-Imar, e-Plan, or imar durumu service.
- URL was manually reviewed and recorded by an authorized reviewer/admin.
- Verification record includes review date and reviewer/admin initials.

## Allowed Source Types
- Municipality e-Imar
- Municipality e-Plan
- Imar durumu service
- Official municipality zoning inquiry page

## Disallowed Sources
- Random blogs
- Agency/marketing pages
- Copied unverified URLs
- Scraped routes
- Unofficial map mirrors

## Verification Workflow
1. Manual URL review.
2. Official domain check.
3. Page purpose check.
4. Date checked recorded.
5. Reviewer/admin initials recorded.

## Status Model
- `VERIFIED_OFFICIAL_SOURCE`
- `NEEDS_MANUAL_REVIEW`
- `NOT_CONFIGURED`
- `DEPRECATED`

## User-Facing Wording
- If verified source exists:
  - Show exact source label.
  - Show "Open official source" link.
- If source is not configured:
  - Show manual guidance only.
  - Show "Exact municipality source URL is not configured yet."

## Boundaries
- No official zoning proof claim.
- Source link does not equal verified imar status.
- User/professional must still verify externally from official institutions.
- No scraping, no auto-search, no external automation in this phase.

## Implementation Notes (Current Phase)
- Registry is frontend-safe guidance infrastructure only.
- No fake municipality URLs are allowed in seeded entries.
- Placeholder entries must remain `NOT_CONFIGURED` until manual verification is completed.

## Current Status
Public launch readiness remains `NOT_READY`.

## Later Product TODO
Keep scheduled: `P2.UI-BUNDLE-1 - Premium Visual System + App/Admin Shell Redesign`.
