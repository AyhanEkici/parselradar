-- P2.GEO-5 dry-run staging schema scaffold only.
-- This file must not execute a full Turkey import by itself.

CREATE SCHEMA IF NOT EXISTS geodata_import_staging;

CREATE TABLE IF NOT EXISTS geodata_import_staging.stage_osm_places (
  osm_id TEXT,
  name TEXT,
  place_type TEXT,
  province TEXT,
  district TEXT,
  confidence TEXT,
  geom geometry(Point, 4326),
  source_version_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geodata_import_staging.stage_osm_roads_major (
  osm_id TEXT,
  name TEXT,
  highway_type TEXT,
  confidence TEXT,
  geom geometry(LineString, 4326),
  source_version_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geodata_import_staging.stage_osm_water_features (
  osm_id TEXT,
  name TEXT,
  water_type TEXT,
  confidence TEXT,
  geom geometry(Geometry, 4326),
  source_version_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stage_osm_places_geom_gist ON geodata_import_staging.stage_osm_places USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_stage_osm_roads_major_geom_gist ON geodata_import_staging.stage_osm_roads_major USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_stage_osm_water_features_geom_gist ON geodata_import_staging.stage_osm_water_features USING GIST (geom);
