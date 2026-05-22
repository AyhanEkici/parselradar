# Opportunity Source Classification Model

## Source Labels
- PUBLIC_SOURCE
- USER_SUBMITTED
- USER_PROVIDED_OFFICIAL_EVIDENCE
- ADMIN_MANUAL_OBSERVATION
- ADMIN_REVIEWED
- OPEN_DATA
- APPROVED_CONNECTOR
- TEST_ONLY_CONNECTOR
- UNVERIFIED
- MISSING
- NEEDS_MANUAL_REVIEW
- NEEDS_OFFICIAL_VERIFICATION

## Confidence Levels
- HIGH_CONFIDENCE
- MEDIUM_CONFIDENCE
- LOW_CONFIDENCE
- UNVERIFIED
- CONTRADICTORY
- MISSING_CRITICAL_EVIDENCE

## Opportunity Score Components
- price_per_m2
- land_size
- location_quality
- road_access
- village/town proximity
- zoning_potential
- infrastructure proximity
- evidence_strength
- liquidity/resale potential
- development potential
- legal/document risk

## Model Rules
- Score inputs must include source label and confidence context.
- Unverified or contradictory evidence reduces usable confidence.
- Missing critical evidence blocks high-confidence ranking.
- TEST_ONLY_CONNECTOR never equals production-grade verified source.

## Disclaimer
Opportunity score is not investment advice and not official valuation.
