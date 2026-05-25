import fs from 'fs';
import path from 'path';
import { validateOsmSource } from './p2Geo5ValidateOsmSource';
import { buildTurkeyOsmImportPlan } from './p2Geo5BuildImportPlan';

interface DryRunPayload {
  phase: 'P2.GEO-5';
  step: 'turkey-osm-dry-run';
  status: 'PASS' | 'FAIL';
  fullTurkeyImportExecuted: false;
  fullExtractDownloaded: false;
  schedulerAdded: false;
  dockerAdded: false;
  sourceUrlValidated: boolean;
  importPlanBuilt: boolean;
  targetTablesListed: boolean;
  layerFiltersListed: boolean;
  attributionOdbLNotePresent: boolean;
  officialVerification: false;
  activeSourceVersionChanged: false;
  productionGeodataSwapped: false;
  sqlTemplatesPresent: {
    stagingSchemaSql: boolean;
    extractionTemplateSql: boolean;
  };
  notes: string[];
  generatedAt: string;
}

const ROOT = process.cwd();
const RESULT_JSON = path.join(ROOT, 'proof/p2-geo-5-turkey-osm-dry-run-results.json');
const RESULT_MD = path.join(ROOT, 'proof/p2-geo-5-turkey-osm-dry-run-results.md');

function writeResult(payload: DryRunPayload) {
  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(RESULT_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const markdown = [
    '# P2.GEO-5 Turkey OSM Dry-Run Results',
    '',
    `- status: ${payload.status}`,
    `- full Turkey OSM import executed: no`,
    `- full extract downloaded: no`,
    `- scheduler added: no`,
    `- Docker added: no`,
    `- source URL validated: ${payload.sourceUrlValidated ? 'yes' : 'no'}`,
    `- import plan built: ${payload.importPlanBuilt ? 'yes' : 'no'}`,
    `- target tables listed: ${payload.targetTablesListed ? 'yes' : 'no'}`,
    `- layer filters listed: ${payload.layerFiltersListed ? 'yes' : 'no'}`,
    `- attribution/ODbL note present: ${payload.attributionOdbLNotePresent ? 'yes' : 'no'}`,
    `- officialVerification false: yes`,
    `- active source version changed: no`,
    `- production geodata swapped: no`,
    `- staging schema sql present: ${payload.sqlTemplatesPresent.stagingSchemaSql ? 'yes' : 'no'}`,
    `- layer extraction template sql present: ${payload.sqlTemplatesPresent.extractionTemplateSql ? 'yes' : 'no'}`,
    '',
    '## Notes',
    ...payload.notes.map((note) => `- ${note}`),
  ].join('\n');

  fs.writeFileSync(RESULT_MD, `${markdown}\n`, 'utf8');
}

async function main() {
  const sourceValidation = await validateOsmSource();
  const plan = buildTurkeyOsmImportPlan();

  const stagingSchemaSqlPath = path.join(ROOT, 'apps/api/scripts/geodata/sql/p2_geo_5_turkey_import_staging_schema.sql');
  const extractionTemplateSqlPath = path.join(ROOT, 'apps/api/scripts/geodata/sql/p2_geo_5_layer_extraction_templates.sql');

  const payload: DryRunPayload = {
    phase: 'P2.GEO-5',
    step: 'turkey-osm-dry-run',
    status: sourceValidation.sourceValidated ? 'PASS' : 'FAIL',
    fullTurkeyImportExecuted: false,
    fullExtractDownloaded: false,
    schedulerAdded: false,
    dockerAdded: false,
    sourceUrlValidated: sourceValidation.sourceValidated,
    importPlanBuilt: true,
    targetTablesListed: plan.targetTables.length > 0,
    layerFiltersListed: Object.keys(plan.filters).length > 0,
    attributionOdbLNotePresent: Boolean(plan.source.attribution && plan.source.sourceLicense),
    officialVerification: false,
    activeSourceVersionChanged: false,
    productionGeodataSwapped: false,
    sqlTemplatesPresent: {
      stagingSchemaSql: fs.existsSync(stagingSchemaSqlPath),
      extractionTemplateSql: fs.existsSync(extractionTemplateSqlPath),
    },
    notes: [
      'Dry-run validates metadata/plan only; no import execution is performed.',
      'No scheduler, Docker, connector activation, scraping, or production source swap in this phase.',
      sourceValidation.metadataCheck.warning ? `Source metadata warning: ${sourceValidation.metadataCheck.warning}` : 'Source metadata HEAD check completed or skipped safely.',
    ],
    generatedAt: new Date().toISOString(),
  };

  writeResult(payload);

  console.log(
    JSON.stringify(
      {
        step: payload.step,
        status: payload.status,
        sourceUrlValidated: payload.sourceUrlValidated,
        importPlanBuilt: payload.importPlanBuilt,
        proof: 'proof/p2-geo-5-turkey-osm-dry-run-results.json',
      },
      null,
      2
    )
  );

  if (payload.status !== 'PASS') {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(
      JSON.stringify(
        {
          step: 'turkey-osm-dry-run',
          status: 'FAIL',
          message: error instanceof Error ? error.message : 'Unknown dry-run error',
        },
        null,
        2
      )
    );
    process.exit(1);
  });
}
