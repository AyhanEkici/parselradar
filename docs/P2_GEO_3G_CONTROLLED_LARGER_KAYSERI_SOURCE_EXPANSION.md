# P2.GEO-3G — Controlled Larger Kayseri-Area Source Expansion

## Purpose

P2.GEO-3G expands the local OSM source from the tiny Kayseri sample to a larger controlled Kayseri-area source.

This phase creates and validates a larger local source only. It does not import the expanded source into PostGIS.

## Scope

Allowed:

- create a larger bounded Kayseri-area OSM-derived GeoJSON source outside the repo
- validate feature count
- validate supported geometry types
- validate source labels and non-official disclaimers
- validate controlled bbox metadata
- validate no full Turkey import
- validate no production swap
- validate source file is not committed

Not allowed:

- DB import
- production table swap
- scheduler/cron
- connector activation
- scraping
- source file commit
- official verification claim
- full Turkey import

## Next phase

P2.GEO-3H may import this controlled expanded source into staging only after P2.GEO-3G is green.
