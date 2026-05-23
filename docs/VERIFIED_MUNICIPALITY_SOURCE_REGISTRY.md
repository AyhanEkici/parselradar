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

## Kayseri Source Verification Table (2026-05-23)

| Municipality | Verified URL | Registry status | Public page status | Notes |
| --- | --- | --- | --- | --- |
| Kayseri Buyuksehir | `https://cbs.kayseri.bel.tr/Kayseri-Kent-Rehberi` | `VERIFIED_OFFICIAL_SOURCE` | `VERIFIED_PUBLIC_MAP` | Official public CBS/kent rehberi page is reachable from the Kayseri Buyuksehir official website. Guidance-only source to check. |
| Kayseri Buyuksehir | `https://www.kayseri.bel.tr/imar-ve-sehircilik` | not added as primary registry URL | `VERIFIED_PUBLIC_IMAR_INFO_PAGE` | Official public imar information page is reachable and provides directorate/process information. |
| Kocasinan | `https://cbs.kocasinan.bel.tr/user/` | `VERIFIED_OFFICIAL_SOURCE` | `VERIFIED_PUBLIC_EIMAR` | Official public e-imar query page is reachable and explicitly states results are informational only with no legal validity. |
| Kocasinan | `https://bulutkbs.gov.tr/Rehber/#/app?52627786` | not added as primary registry URL | `VERIFIED_PUBLIC_MAP` | Official public kent rehberi link is exposed from the Kocasinan official site via an official delegated public map service. |
| Melikgazi | `https://cbs.melikgazi.bel.tr/portal/apps/webappviewer/index.html?id=9999a7e224d24b0d96b93911530cb4d3` | `VERIFIED_OFFICIAL_SOURCE` | `VERIFIED_PUBLIC_MAP` | Official public CBS map is reachable from the Melikgazi official site. |
| Melikgazi | `https://imar.melikgazi.bel.tr/YapiBelgeleriWeb/Kullanici` | not added | `BLOCKED_BY_LOGIN` | D-Imar page is reachable but requires login and shows CAPTCHA/e-Devlet options, so it is not treated as a public registry source. |
| Talas | `https://www.talas.bel.tr/uygulama-imar-planlari` | `VERIFIED_OFFICIAL_SOURCE` | `VERIFIED_PUBLIC_IMAR_INFO_PAGE` | Official public imar plan listing page is reachable and exposes downloadable plan records. |
| Talas | `https://www.talas.bel.tr/tr/imar-ve-sehircilik-mudurlugu` | not added as primary registry URL | `VERIFIED_PUBLIC_IMAR_INFO_PAGE` | Official public directorate information page is reachable and provides process/document guidance. |

## Blocked or Access-Gated Sources
- Melikgazi D-Imar (`https://imar.melikgazi.bel.tr/YapiBelgeleriWeb/Kullanici`): blocked by login and CAPTCHA. Public reachability does not authorize automation or connector activation.

## Unverified or Not-Found Kayseri District Sources (Current Verification Window)
- No verified public e-imar / map / imar-info source was confirmed in this run for: Incesu, Develi, Hacilar, Bunyan, Yahyali, Tomarza, Pinarbasi, Yesilhisar, Sarioglan, Sariz, Akkisla, Felahiye, Ozvatan.
- These municipalities are not added to the registry in this phase.
- Reason: no official public source URL was confirmed manually from the current verification pass without guessing, bypassing, or relying on noisy/unreliable search results.

## Source Access Notes
- Registry entries are public source references only.
- A verified public source URL does not mean the property itself is verified.
- A public map, kent rehberi, or imar page does not equal official zoning proof.
- No automated zoning verification, no scraping, and no hidden/private endpoint use is introduced by these entries.

## Later Product TODO
Keep scheduled: `P2.UI-BUNDLE-1 - Premium Visual System + App/Admin Shell Redesign`.
