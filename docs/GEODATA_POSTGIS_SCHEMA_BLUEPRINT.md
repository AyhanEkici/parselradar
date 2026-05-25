# Geodata PostGIS Schema Blueprint (P2.GEO-1)

## Scope
This document defines the target PostGIS schema for future geodata signal queries.
No runtime migrations or installations are executed in this phase.

## Core Tables

### geo_source_versions
- id
- sourceName
- sourceUrl
- sourceLicense
- extractDate
- importedAt
- versionHash
- notes

### geo_places
- id
- osmId
- name
- placeType
- adminLevel
- province
- district
- geom
- sourceVersionId

### geo_admin_centers
- id
- name
- centerType
- province
- district
- geom
- sourceVersionId

### geo_roads_major
- id
- osmId
- name
- highwayType
- geom
- sourceVersionId

### geo_industrial_areas
- id
- osmId
- name
- industrialType
- isOsbCandidate
- geom
- sourceVersionId

### geo_osb_curated
- id
- name
- province
- district
- geom
- source
- confidence
- verifiedAt
- notes

### geo_water_features
- id
- osmId
- name
- waterType
- geom
- sourceVersionId

### geo_tourism_features
- id
- osmId
- name
- tourismType
- geom
- sourceVersionId

### geo_elevation_cache
- id
- lat
- lon
- elevationM
- slopeSignal
- source
- sourceVersion
- computedAt

## Index Blueprint
Required index direction:
- GIST indexes on all geom columns.
- B-tree indexes on high-selectivity type/name fields where useful.

Recommended examples:
- geo_places(placeType, province, district)
- geo_admin_centers(centerType, province, district)
- geo_roads_major(highwayType)
- geo_industrial_areas(industrialType, isOsbCandidate)
- geo_osb_curated(province, district, confidence)
- geo_water_features(waterType)
- geo_tourism_features(tourismType)
- geo_source_versions(sourceName, extractDate, versionHash)
- geo_elevation_cache(lat, lon, computedAt)

## Integrity Rules
- No production query without sourceVersionId traceability (or sourceVersion for elevation cache).
- Every signal must be traceable to source version and source date.
- Curated datasets (geo_osb_curated) must still include source metadata and confidence.
- Version entries must be immutable audit references once published.

## Query Reliability Notes
- Geometry SRID must be standardized before distance computations.
- Distance outputs must include unit policy (km).
- Nearest-feature queries should avoid full-table scans by using spatial indexes.
