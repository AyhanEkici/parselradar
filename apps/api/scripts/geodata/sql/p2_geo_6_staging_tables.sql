CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS public.geo_import_runs (
  id BIGSERIAL PRIMARY KEY,
  phase TEXT NOT NULL,
  source_name TEXT,
  source_path_hash TEXT,
  source_checksum TEXT,
  import_scope TEXT NOT NULL,
  import_mode TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.geo_staging_features (
  id BIGSERIAL PRIMARY KEY,
  import_run_id BIGINT REFERENCES public.geo_import_runs(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL,
  source_layer TEXT,
  source_id TEXT,
  name TEXT,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  geom GEOMETRY(Geometry, 4326),
  source_label TEXT NOT NULL DEFAULT 'PUBLIC_SOURCE_SIGNAL',
  official_verification BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_geo_staging_features_geom
  ON public.geo_staging_features
  USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_geo_staging_features_feature_type
  ON public.geo_staging_features (feature_type);

CREATE INDEX IF NOT EXISTS idx_geo_staging_features_name
  ON public.geo_staging_features (name);

CREATE INDEX IF NOT EXISTS idx_geo_import_runs_phase_status
  ON public.geo_import_runs (phase, status);
