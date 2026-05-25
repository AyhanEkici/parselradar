CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS geo_source_versions (
  id BIGSERIAL PRIMARY KEY,
  sourceName TEXT NOT NULL,
  sourceUrl TEXT NOT NULL,
  sourceLicense TEXT NOT NULL,
  sourceUseLabel TEXT NOT NULL,
  officialVerification BOOLEAN NOT NULL DEFAULT FALSE,
  extractDate TIMESTAMPTZ NOT NULL,
  importedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  versionHash TEXT NOT NULL UNIQUE,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS geo_places (
  id BIGSERIAL PRIMARY KEY,
  osmId TEXT,
  name TEXT NOT NULL,
  placeType TEXT NOT NULL,
  adminLevel TEXT,
  province TEXT,
  district TEXT,
  confidence TEXT NOT NULL DEFAULT 'POC_ONLY_LOW',
  geom GEOMETRY(POINT, 4326) NOT NULL,
  sourceVersionId BIGINT NOT NULL REFERENCES geo_source_versions(id)
);

CREATE TABLE IF NOT EXISTS geo_admin_centers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  centerType TEXT NOT NULL,
  province TEXT,
  district TEXT,
  confidence TEXT NOT NULL DEFAULT 'POC_ONLY_LOW',
  geom GEOMETRY(POINT, 4326) NOT NULL,
  sourceVersionId BIGINT NOT NULL REFERENCES geo_source_versions(id)
);

CREATE TABLE IF NOT EXISTS geo_roads_major (
  id BIGSERIAL PRIMARY KEY,
  osmId TEXT,
  name TEXT NOT NULL,
  highwayType TEXT NOT NULL,
  confidence TEXT NOT NULL DEFAULT 'POC_ONLY_LOW',
  geom GEOMETRY(LINESTRING, 4326) NOT NULL,
  sourceVersionId BIGINT NOT NULL REFERENCES geo_source_versions(id)
);

CREATE TABLE IF NOT EXISTS geo_industrial_areas (
  id BIGSERIAL PRIMARY KEY,
  osmId TEXT,
  name TEXT NOT NULL,
  industrialType TEXT NOT NULL,
  isOsbCandidate BOOLEAN NOT NULL DEFAULT FALSE,
  confidence TEXT NOT NULL DEFAULT 'POC_ONLY_LOW',
  geom GEOMETRY(POLYGON, 4326) NOT NULL,
  sourceVersionId BIGINT NOT NULL REFERENCES geo_source_versions(id)
);

CREATE TABLE IF NOT EXISTS geo_osb_curated (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  province TEXT,
  district TEXT,
  geom GEOMETRY(POINT, 4326) NOT NULL,
  source TEXT NOT NULL,
  confidence TEXT NOT NULL DEFAULT 'POC_ONLY_LOW',
  verifiedAt TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS geo_water_features (
  id BIGSERIAL PRIMARY KEY,
  osmId TEXT,
  name TEXT NOT NULL,
  waterType TEXT NOT NULL,
  confidence TEXT NOT NULL DEFAULT 'POC_ONLY_LOW',
  geom GEOMETRY(POLYGON, 4326) NOT NULL,
  sourceVersionId BIGINT NOT NULL REFERENCES geo_source_versions(id)
);

CREATE TABLE IF NOT EXISTS geo_tourism_features (
  id BIGSERIAL PRIMARY KEY,
  osmId TEXT,
  name TEXT NOT NULL,
  tourismType TEXT NOT NULL,
  confidence TEXT NOT NULL DEFAULT 'POC_ONLY_LOW',
  geom GEOMETRY(POINT, 4326) NOT NULL,
  sourceVersionId BIGINT NOT NULL REFERENCES geo_source_versions(id)
);

CREATE TABLE IF NOT EXISTS geo_elevation_cache (
  id BIGSERIAL PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  elevationM DOUBLE PRECISION NOT NULL,
  slopeSignal TEXT NOT NULL,
  source TEXT NOT NULL,
  sourceVersion TEXT NOT NULL,
  computedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geo_places_geom_gist ON geo_places USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_geo_admin_centers_geom_gist ON geo_admin_centers USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_geo_roads_major_geom_gist ON geo_roads_major USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_geo_industrial_areas_geom_gist ON geo_industrial_areas USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_geo_osb_curated_geom_gist ON geo_osb_curated USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_geo_water_features_geom_gist ON geo_water_features USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_geo_tourism_features_geom_gist ON geo_tourism_features USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_geo_places_type_name ON geo_places(placeType, name);
CREATE INDEX IF NOT EXISTS idx_geo_admin_centers_type_name ON geo_admin_centers(centerType, name);
CREATE INDEX IF NOT EXISTS idx_geo_roads_major_type_name ON geo_roads_major(highwayType, name);
CREATE INDEX IF NOT EXISTS idx_geo_industrial_areas_type_name ON geo_industrial_areas(industrialType, name);
CREATE INDEX IF NOT EXISTS idx_geo_water_features_type_name ON geo_water_features(waterType, name);
CREATE INDEX IF NOT EXISTS idx_geo_tourism_features_type_name ON geo_tourism_features(tourismType, name);
CREATE INDEX IF NOT EXISTS idx_geo_source_versions_name_hash ON geo_source_versions(sourceName, versionHash);
CREATE INDEX IF NOT EXISTS idx_geo_elevation_cache_lat_lon ON geo_elevation_cache(lat, lon);
