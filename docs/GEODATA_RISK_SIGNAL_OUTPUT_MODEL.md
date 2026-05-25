# Geodata Risk Signal Output Model (P2.GEO-1)

## Scope
This model defines how future geodata context enriches Basic Risk Scan outputs.
This is a documentation-only definition.

## Integration Rule
Geodata signal enrichment applies only when locationConfidence is MEDIUM or HIGH.
If LOW, geodata precision outputs are blocked and more location data is requested.

## Signal Model Examples

### ROAD_ACCESS_CONTEXT_SIGNAL
Includes:
- nearest main road distance
- highway type context where available
Boundary:
- not official cadastral road access confirmation

### SETTLEMENT_CONTEXT_SIGNAL
Includes:
- distance to village/hamlet/neighborhood equivalents
Boundary:
- not official koy ici legal status

### INDUSTRIAL_OSB_CONTEXT_SIGNAL
Includes:
- proximity to industrial areas and curated OSB candidates
Boundary:
- not investment return guarantee

### WATER_TOURISM_CONTEXT_SIGNAL
Includes:
- proximity to water/coast/tourism features
Boundary:
- not view, permit, or buildability proof

### TERRAIN_SIGNAL
Includes:
- elevation and slope context
Boundary:
- not construction suitability decision

### HAZARD_CONTEXT_SIGNAL
Includes:
- region-level hazard context placeholder
Boundary:
- professional and official review required

## Required Output Fields
Each geodata-enriched signal should include:
- type
- value
- distanceKm (if applicable)
- source
- sourceVersion
- confidence
- officialVerification (false)
- label
- disclaimer

## Mandatory Disclaimers
All geodata outputs must include these meaning constraints:
- public source signal
- approximate
- not official verification
- includes source version/date
- requires official confirmation

## Label Policy
Expected labels:
- PUBLIC_SOURCE_SIGNAL
- TERRAIN_SIGNAL
- HAZARD_CONTEXT_SIGNAL
- NEEDS_OFFICIAL_CONFIRMATION
- NOT_OFFICIAL_FOR_LEGAL_ACTIONS

No label may imply official tapu/imar verification.
