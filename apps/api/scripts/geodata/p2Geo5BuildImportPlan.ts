import fs from 'fs';
import path from 'path';

export interface TurkeyOsmImportPlan {
  phase: 'P2.GEO-5';
  step: 'build-import-plan';
  planMode: 'DRY_RUN_ONLY';
  fullTurkeyImportExecuted: false;
  fullExtractDownloaded: false;
  schedulerAdded: false;
  dockerAdded: false;
  activeSourceVersionChanged: false;
  productionGeodataSwapped: false;
  source: {
    sourceName: string;
    sourceUrl: string;
    sourceLicense: string;
    attribution: string;
  };
  layers: string[];
  targetTables: string[];
  filters: Record<string, string[]>;
  labels: Array<'PUBLIC_SOURCE_SIGNAL' | 'NEEDS_OFFICIAL_CONFIRMATION'>;
  officialVerification: false;
  generatedAt: string;
}

const ROOT = process.cwd();
const PLAN_JSON = path.join(ROOT, 'proof/p2-geo-5-turkey-osm-import-plan.json');

function writePlan(plan: TurkeyOsmImportPlan) {
  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(PLAN_JSON, `${JSON.stringify(plan, null, 2)}\n`, 'utf8');
}

export function buildTurkeyOsmImportPlan(): TurkeyOsmImportPlan {
  const plan: TurkeyOsmImportPlan = {
    phase: 'P2.GEO-5',
    step: 'build-import-plan',
    planMode: 'DRY_RUN_ONLY',
    fullTurkeyImportExecuted: false,
    fullExtractDownloaded: false,
    schedulerAdded: false,
    dockerAdded: false,
    activeSourceVersionChanged: false,
    productionGeodataSwapped: false,
    source: {
      sourceName: 'Geofabrik Turkey OSM Extract',
      sourceUrl: 'https://download.geofabrik.de/europe/turkey.html',
      sourceLicense: 'OSM_ODbL_REQUIRED',
      attribution: 'Map and geodata signals derived from OpenStreetMap contributors. Used as public context signals only.',
    },
    layers: [
      'places',
      'admin centers',
      'major roads',
      'settlements',
      'industrial/OSB candidates',
      'water features',
      'tourism features',
    ],
    targetTables: [
      'geo_places',
      'geo_admin_centers',
      'geo_roads_major',
      'geo_industrial_areas',
      'geo_water_features',
      'geo_tourism_features',
      'geo_source_versions',
    ],
    filters: {
      roads: ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'],
      places: ['city', 'town', 'village', 'hamlet', 'neighbourhood'],
      industrial: ['landuse=industrial', 'industrial=*', 'name contains OSB/Sanayi'],
      water: ['natural=water', 'water=lake', 'water=reservoir', 'coastline', 'river'],
      tourism: ['tourism=*', 'leisure=*'],
    },
    labels: ['PUBLIC_SOURCE_SIGNAL', 'NEEDS_OFFICIAL_CONFIRMATION'],
    officialVerification: false,
    generatedAt: new Date().toISOString(),
  };

  writePlan(plan);
  return plan;
}

function main() {
  const plan = buildTurkeyOsmImportPlan();
  console.log(
    JSON.stringify(
      {
        step: plan.step,
        planMode: plan.planMode,
        layerCount: plan.layers.length,
        targetTableCount: plan.targetTables.length,
        proof: 'proof/p2-geo-5-turkey-osm-import-plan.json',
      },
      null,
      2
    )
  );
}

if (require.main === module) {
  main();
}
