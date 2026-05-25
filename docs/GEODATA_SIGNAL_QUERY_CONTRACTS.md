# Geodata Signal Query Contracts (P2.GEO-1)

## Scope
Contract blueprint only. No runtime implementation in this phase.

## Input Contract
```json
{
  "propertyId": "",
  "lat": 0,
  "lon": 0,
  "locationConfidence": "LOW|MEDIUM|HIGH",
  "propertyCategory": "arsa|tarla|bahce|konut|daire|other"
}
```

## Gate Rule
- If locationConfidence is LOW, precise geodata distance signals are blocked.
- If locationConfidence is MEDIUM or HIGH, public-source context signals may be returned.

## LOW Confidence Response
```json
{
  "status": "BLOCKED_LOW_LOCATION_CONFIDENCE",
  "requiredNextData": ["pin", "mahalle", "ada/parsel", "coordinate"]
}
```

## MEDIUM/HIGH Response Shape
```json
{
  "status": "OK_PUBLIC_GEODATA_CONTEXT",
  "signals": [
    {
      "type": "NEAREST_DISTRICT_CENTER",
      "value": "Kocasinan ilce merkezi",
      "distanceKm": 4.2,
      "source": "Geofabrik OSM",
      "sourceVersion": "osm-tr-2026-05-01",
      "confidence": "MEDIUM",
      "officialVerification": false,
      "label": "PUBLIC_SOURCE_SIGNAL",
      "disclaimer": "Approximate public-source context. Not official verification."
    }
  ]
}
```

## Required Signal Types
- NEAREST_DISTRICT_CENTER
- NEAREST_MAIN_ROAD
- NEAREST_SETTLEMENT
- INDUSTRIAL_OR_OSB_PROXIMITY
- WATER_OR_COAST_PROXIMITY
- TOURISM_PROXIMITY
- TERRAIN_ELEVATION
- TERRAIN_SLOPE_SIGNAL
- HAZARD_CONTEXT_PLACEHOLDER

## Signal Field Contract
Each signal must include:
- type
- value
- distanceKm (if distance-based)
- source
- sourceVersion
- confidence
- officialVerification
- label
- disclaimer

## Label Contract
Allowed examples:
- PUBLIC_SOURCE_SIGNAL
- TERRAIN_SIGNAL
- HAZARD_CONTEXT_SIGNAL
- NEEDS_OFFICIAL_CONFIRMATION

## Verification Boundary
- No signal may be labeled as official tapu/imar verification.
- officialVerification must remain false for these geodata context outputs.
- Output disclaimers must explicitly state that confirmation requires official sources.
