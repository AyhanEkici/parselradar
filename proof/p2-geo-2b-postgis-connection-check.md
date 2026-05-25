# P2.GEO-2B PostGIS Connection Check

## Status
- CONFIG_REQUIRED

## Reason
- GEODATA_DATABASE_URL is missing in current terminal session.

## Safe Setup Instructions
- In PowerShell session only:
  - $env:GEODATA_DATABASE_URL = "postgresql://user:password@host:5432/parselradar_geodata"
- Do not commit .env or any secret values.
- Re-run this phase after environment variable is set.

## Evidence
- Connection was not attempted because configuration was missing.
- PostgreSQL version: not checked.
- Database name: not checked.
- PostGIS extension availability: unknown.
