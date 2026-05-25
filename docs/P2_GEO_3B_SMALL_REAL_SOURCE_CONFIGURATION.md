# P2.GEO-3B — Small Real Source Configuration

## Purpose

P2.GEO-3B configures and validates one real small local source file before any staged import.

This phase does not import data into PostGIS.

## Allowed

- local file path validation
- file size capture
- file checksum capture
- source basename capture
- source path hash capture
- extension recognition
- scope/mode guard
- proof artifact generation

## Not allowed

- full Turkey import
- production swap
- scheduler/cron
- connector activation
- scraping
- source file commit
- official verification claim

## Supported now

- .geojson
- .json

## Recognized but later tooling required

- .osm.pbf
- .pbf
- .osm

## Required next phase

P2.GEO-3C may import only after this source configuration is green and still limited to a small region.
