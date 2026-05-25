# P2_GEO_4 OSM Layer Extraction Plan

## Target OSM Layers
- Places
- Admin centers
- Major roads
- Settlements
- Industrial / OSB candidates
- Water features
- Tourism features

## Target Tables
- geo_places
- geo_admin_centers
- geo_roads_major
- geo_industrial_areas
- geo_water_features
- geo_tourism_features
- geo_source_versions

## Extraction Filters (Examples)
### Roads
- highway in: motorway, trunk, primary, secondary, tertiary

### Places
- place in: city, town, village, hamlet, neighbourhood

### Industrial / OSB candidates
- landuse=industrial
- industrial=* tags
- name contains OSB or Sanayi patterns

### Water
- natural=water
- water in: lake, reservoir
- coastline and river features where relevant to context

### Tourism
- tourism=*
- leisure=* where place context is relevant

## Data Quality and Labeling Rules
- No official imar/tapu inference from OSM features.
- OSM quality varies by region and feature class.
- Every returned signal must include confidence and source label.
- Every signal remains public context only and requires official confirmation.
