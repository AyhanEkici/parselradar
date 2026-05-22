# Manual Official Evidence Upload Runbook

## Purpose
This runbook defines a manual, legitimate workflow for handling official parcel-related evidence without credential collection, scraping, or connector activation.

## Step-by-Step Workflow
1. User starts analysis in ParselRadar.
2. User enters baseline property context:
- property URL
- il / ilce / mahalle
- ada / parsel if known
- address if known
3. User optionally uploads supporting evidence:
- tapu screenshots or documents
- parcel registry screenshots
- zoning or imar screenshots
- UCBP or TUCBS screenshots
- municipality documents
- title or parcel-related evidence
- listing screenshots
- photos
4. User redacts sensitive data before upload:
- T.C. Kimlik number
- e-Devlet username or password
- session tokens
- private phone or email if not needed
- unrelated family or person details
5. ParselRadar marks uploaded artifacts as:
- USER_PROVIDED_OFFICIAL_EVIDENCE
6. Report labels are separated as:
- VERIFIED_BY_APPROVED_CONNECTOR
- USER_PROVIDED_OFFICIAL_EVIDENCE
- PUBLIC_SOURCE
- UNVERIFIED
- MISSING
- NEEDS_MANUAL_REVIEW
7. Report warning is always shown:
- User-provided evidence improves confidence but does not replace official legal and technical due diligence.

## Portal Evidence Clarification
- Individual users may manually download or screenshot evidence from portals where legally permitted.
- Uploaded portal artifacts remain USER_PROVIDED_OFFICIAL_EVIDENCE.
- Uploaded portal artifacts are not platform-certified government connector data.

## Operational Constraints
- No e-Devlet credential capture.
- No automated e-Devlet login.
- No session cookie storage.
- No scraping of authenticated pages.
- No connector activation in this workflow.
