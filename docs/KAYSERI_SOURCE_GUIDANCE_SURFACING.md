# KAYSERI SOURCE GUIDANCE SURFACING

## Scope
This document records P2.CONNECTOR-2A.1 implementation details for surfacing verified Kayseri municipality source guidance in report and document upload flows.

## Updated Surfaces
- Property result page: source guidance summary block for missing evidence actions.
- User property documents page: intent-based upload guidance panel.
- Admin property documents page: intent-based upload guidance panel.

## Required Wording Rules
The MUNICIPAL_ZONING guidance now uses the following mandatory wording:
- "Official public source to check manually"
- "This is guidance only, not automated zoning verification"
- "Upload a screenshot/document as supporting evidence after checking the source"

Disallowed implication patterns remain unchanged:
- No "verified zoning" claim.
- No "officially confirmed" claim.
- No "automated e-Imar result" claim.
- No investment suitability or buy/sell advice generated from source links.

## Behavior Matrix

| Scenario | Public source status label | UI behavior | Upload behavior boundary |
| --- | --- | --- | --- |
| District-level verified public e-imar | `VERIFIED_PUBLIC_EIMAR` | Show exact source label and open link CTA | Upload supporting screenshot/document only |
| District-level verified public map source | `VERIFIED_PUBLIC_MAP` | Show exact source label and open link CTA | Upload supporting screenshot/document only |
| District-level verified imar info page | `VERIFIED_PUBLIC_IMAR_INFO_PAGE` | Show exact source label and open link CTA | Upload supporting screenshot/document only |
| District source not configured but city-level source exists | city/province source status from fallback entry | Show city/province source as manual guidance fallback | Upload supporting screenshot/document only |
| No configured source found | `NOT_CONFIGURED` | Show manual guidance text and disabled source CTA | Upload supporting screenshot/document only |
| Known access-gated source exists | `BLOCKED_BY_LOGIN` or `BLOCKED_BY_CAPTCHA` | Show blocked source note (reference only) with no automation | Upload supporting screenshot/document only |

## Blocked-Source Handling
- Access-gated municipality pages are tracked as blocked references.
- Blocked references are surfaced for operator awareness only.
- Login/CAPTCHA/e-Devlet/manual gate pages are never treated as automation targets.
- Public launch boundary remains unchanged: no scrape, no bypass, no connector auto-verification.

## Controlled Beta Limitation
- This capability is guidance-only for controlled beta operation.
- Source links improve manual evidence collection UX; they do not provide property-level official verification.
- Public launch readiness remains `NOT_READY`.
