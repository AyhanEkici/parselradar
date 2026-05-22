# Admin Opportunity Sourcing Workflow

## Purpose
Define a lawful admin workflow for gathering, classifying, reviewing, and preparing real estate opportunities for future AI ranking without using personal e-Devlet credentials as platform connector credentials.

## Admin Input Fields
- listing URL
- source platform
- province
- district
- mahalle
- ada/parsel
- price
- land size m2
- TL/m2
- zoning/imar claim
- road/access notes
- infrastructure notes
- seller/agent notes
- screenshots/documents
- manual UCBP/e-Devlet observation summary, if any
- evidence confidence
- opportunity status

## Allowed Admin Actions
- manually add opportunity
- upload redacted evidence
- classify source
- mark missing proof
- mark needs official verification
- mark high potential
- reject opportunity
- prepare for AI ranking

## Forbidden Admin Actions
- storing e-Devlet credentials
- storing session cookies
- scraping authenticated portals
- using personal e-Devlet session as platform connector
- claiming official legal verification without approved source

## Opportunity Lifecycle
- NEW_LEAD
- DATA_CAPTURED
- EVIDENCE_UPLOADED
- ADMIN_REVIEWED
- NEEDS_OFFICIAL_CHECK
- HIGH_POTENTIAL
- REJECTED
- READY_FOR_REPORT
- READY_FOR_AI_RANKING

## Governance Boundary
- Personal e-Devlet access can support manual evidence context only.
- Platform-level authority requires approved connectors and separate legal/technical onboarding.
