# P2.GEO-3H — Controlled Expanded Source Staged Import

## Purpose

P2.GEO-3H imports the controlled expanded Kayseri-area OSM-derived source into PostGIS staging tables only.

## Scope

Allowed:

- import `kayseri-osm-controlled-expanded.geojson` from local source directory
- write a new `geo_import_runs` row with phase `P2.GEO-3H`
- write staged features into `geo_staging_features`
- update staged adapter preference to latest P2.GEO-3H run
- re-prove adapter/API/admin UI/freshness policy

Not allowed:

- full Turkey import
- production table swap
- scheduler/cron
- connector activation
- scraping
- source file commit
- official verification claim

## Positioning

The staged signals remain OpenStreetMap-derived public-source context signals only. They are not official tapu, imar, cadastre, zoning, legal, investment, or construction verification.
