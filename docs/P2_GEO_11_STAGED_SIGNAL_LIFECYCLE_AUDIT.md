# P2.GEO-11 — Staged Signal Lifecycle Audit Hardening

## Purpose

P2.GEO-11 hardens lifecycle visibility around staged geodata signals before any Turkey OSM import.

This phase verifies:

- latest staged import run status
- source checksum visibility
- source name visibility
- import scope and mode
- import age / freshness metadata
- staged feature count
- geometry validity
- required feature type coverage
- officialVerification remains false
- source label remains PUBLIC_SOURCE_SIGNAL
- signal readiness is traceable from proof artifacts
- production swap remains blocked

## Hard boundaries

- No production geo table swap
- No public product claim
- No connector activation
- No scraping
- No scheduler
- No official tapu/imar/cadastre/zoning/legal/investment/construction verification claim
- PostGIS remains staged geodata signal DB
- MongoDB remains product DB

## Lifecycle states

- CONFIG_REQUIRED
- STAGED_IMPORT_REQUIRED
- STAGED_IMPORT_READY
- STAGED_SIGNAL_READY
- STAGED_SIGNAL_STALE
- STAGED_SIGNAL_INCOMPLETE
- FAIL

## Required checks before Turkey OSM import

Before P2.GEO-3 Turkey OSM import can start:

- latest staged import audit must PASS
- staging tables must be readable
- latest run must have visible checksum
- staged features must have valid geometry
- signal adapter/API/diagnostic proofs must exist
- no production swap must be present
- no hidden official verification claim may exist
