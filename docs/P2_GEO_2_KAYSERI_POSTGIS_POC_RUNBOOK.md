# P2.GEO-2 Kayseri PostGIS POC Runbook

## Scope and Guardrails
- This is a controlled Kayseri-only PostGIS POC.
- No Docker in this phase.
- No full Turkey import in this phase.
- No daily scheduler in this phase.
- No connector activation.
- No TKGM/e-imar automation.
- No scraping.
- No official verification claim.

## Required Configuration (Shell/Runtime Only)
Do not mutate .env in this phase.
Set GEODATA_DATABASE_URL in your shell/session when running POC commands:

GEODATA_DATABASE_URL=postgresql://user:password@host:5432/parselradar_geodata

PowerShell session example (local only, do not commit secrets):

$env:GEODATA_DATABASE_URL = "postgresql://user:password@host:5432/parselradar_geodata"

Remove from current session when finished:

Remove-Item Env:GEODATA_DATABASE_URL

If GEODATA_DATABASE_URL is missing, POC scripts return CONFIG_REQUIRED and do not crash product baseline.

## Setup Steps
1. Apply schema SQL:
- npm run geo:p2-geo-2:schema

2. Seed small deterministic Kayseri POC data:
- npm run geo:p2-geo-2:seed

3. Execute POC signal query test:
- npm run geo:p2-geo-2:test

## What CONFIG_REQUIRED Means
- GEODATA_DATABASE_URL is not configured in the active shell.
- Script exits in controlled non-fatal mode.
- Product baseline validations remain unaffected.

Expected command behavior:
- `npm run geo:p2-geo-2:schema`: CONFIG_REQUIRED if env is missing, APPLIED if env is present and DB permissions are valid.
- `npm run geo:p2-geo-2:seed`: CONFIG_REQUIRED if env is missing, SEEDED if env is present and schema exists.
- `npm run geo:p2-geo-2:test`: CONFIG_REQUIRED if env is missing, PASS for live POC query success.

## Troubleshooting (PostGIS Permissions)
- If schema apply fails with extension permissions, ask DB admin to enable PostGIS (`CREATE EXTENSION postgis`) for the target database.
- Verify the connection points to dedicated geodata POC database, not product MongoDB services.
- Ensure role has table create/index privileges for the POC schema objects.

## Signal Interpretation
The test script returns public-source context signals for a Kayseri test coordinate:
- nearest district/center
- nearest main road
- nearest settlement
- nearest industrial/OSB candidate
- nearest water feature
- optional tourism signal
- terrain/elevation signal (or placeholder)
- hazard context placeholder

Each signal includes:
- type
- value
- distanceKm (where applicable)
- source
- sourceVersion
- confidence
- officialVerification=false
- label
- disclaimer

## Warnings
- POC only.
- Not production geodata.
- Not official verification.
- No official boundary authority implied.
- No TKGM/e-imar automation.
