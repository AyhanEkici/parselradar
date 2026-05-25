# P2.GEO-2B-SSL-FIX-RETRY Kayseri Signal Results

## Status
- PASS

## Secret Safety
- GEODATA_DATABASE_URL present: yes (value hidden)
- GEODATA_DATABASE_URL value printed: no

## Root Cause
- The original bind mismatch issue remains fixed in apps/api/scripts/geodata/p2Geo2TestKayseriSignals.ts.
- Current run is blocked by node pg SSL certificate validation failure (SELF_SIGNED_CERT_IN_CHAIN).

## Connectivity Gate
- hostType: pooler
- configured port: 6543
- configured port reachable: yes
- hasSslMode: false
- node pg connected: yes
- node pg error code: none

## Command Results
- geo:p2-geo-2:schema: PASS
- geo:p2-geo-2:seed: PASS
- geo:p2-geo-2:test: PASS

## Signal Contract Check
- returned signal count: 8
- returned signal names: NEAREST_DISTRICT_CENTER, NEAREST_MAIN_ROAD, NEAREST_SETTLEMENT, INDUSTRIAL_OR_OSB_PROXIMITY, WATER_OR_COAST_PROXIMITY, TOURISM_PROXIMITY, TERRAIN_ELEVATION, HAZARD_CONTEXT_PLACEHOLDER
- source labels returned: PUBLIC_SOURCE_SIGNAL, TERRAIN_SIGNAL, NEEDS_OFFICIAL_CONFIRMATION
- disclaimers returned: yes
- nearest district/center returned: yes
- nearest main road returned: yes
- nearest settlement returned: yes
- industrial/OSB candidate returned: yes
- water feature returned: yes
- labels/disclaimers returned: yes
- officialVerification false: yes
