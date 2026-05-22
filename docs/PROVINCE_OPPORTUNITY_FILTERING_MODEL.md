# Province Opportunity Filtering Model

## Scope
This model defines how admin manually filters opportunities by province/city signal quality before any future AI ranking.

## Required Fields
- province
- district
- mahalle/koy
- listing URL
- price
- m2
- TL/m2
- ada/parsel
- road access
- settlement proximity
- infrastructure proximity
- zoning/plan claim
- UCBP layers checked
- positive signals
- risk signals
- missing proof
- evidence score
- opportunity score
- admin decision

## Recommended UCBP Layer Categories To Inspect
- plan/imar/cevre duzeni
- road/transport
- infrastructure
- hydrology/water
- disaster/risk
- protected areas/sit/cevre koruma
- ortofoto
- land use/soil/agricultural context
- open data layers where visible

## Source Classification Requirement
- ADMIN_MANUAL_OBSERVATION
- ACCESS_CONTROLLED_INFORMATIONAL_SOURCE
- PUBLIC_SOURCE
- USER_PROVIDED_OFFICIAL_EVIDENCE
- UNVERIFIED
- MISSING
- NEEDS_OFFICIAL_VERIFICATION

## Scoring Guardrails
- Evidence score and opportunity score are decision-support only.
- Low evidence confidence must reduce score reliability.
- Missing critical proof prevents high-confidence ranking.
- Score is not legal validation, investment advice, or official valuation.
