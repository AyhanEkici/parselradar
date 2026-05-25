import fs from 'fs';
import path from 'path';
import https from 'https';

export interface SourceValidationResult {
  phase: 'P2.GEO-5';
  step: 'validate-osm-source';
  sourceName: string;
  sourceUrl: string;
  allowedUrl: string;
  sourceUrlMatchesAllowed: boolean;
  expectedFormats: string[];
  licenseNote: string;
  attribution: string;
  metadataCheck: {
    attempted: boolean;
    method: 'HEAD';
    statusCode: number | null;
    reachable: boolean;
    contentType?: string;
    contentLength?: string;
    warning?: string;
  };
  sourceValidated: boolean;
  officialVerification: false;
  label: 'PUBLIC_SOURCE_SIGNAL';
  generatedAt: string;
}

const ROOT = process.cwd();
const PROOF_JSON = path.join(ROOT, 'proof/p2-geo-5-validate-osm-source-results.json');
const ALLOWED_SOURCE_URL = 'https://download.geofabrik.de/europe/turkey.html';

function writeProof(payload: SourceValidationResult) {
  fs.mkdirSync(path.join(ROOT, 'proof'), { recursive: true });
  fs.writeFileSync(PROOF_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function headRequest(url: string): Promise<SourceValidationResult['metadataCheck']> {
  return new Promise((resolve) => {
    const req = https.request(
      url,
      {
        method: 'HEAD',
        timeout: 8000,
      },
      (res) => {
        resolve({
          attempted: true,
          method: 'HEAD',
          statusCode: res.statusCode || null,
          reachable: Boolean(res.statusCode && res.statusCode >= 200 && res.statusCode < 500),
          contentType: String(res.headers['content-type'] || ''),
          contentLength: String(res.headers['content-length'] || ''),
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('HEAD_TIMEOUT'));
    });

    req.on('error', (error) => {
      resolve({
        attempted: true,
        method: 'HEAD',
        statusCode: null,
        reachable: false,
        warning: error instanceof Error ? error.message : 'Unknown HEAD request error',
      });
    });

    req.end();
  });
}

export async function validateOsmSource(sourceUrl: string = ALLOWED_SOURCE_URL): Promise<SourceValidationResult> {
  const metadataCheck = await headRequest(sourceUrl);
  const sourceUrlMatchesAllowed = sourceUrl === ALLOWED_SOURCE_URL;

  const result: SourceValidationResult = {
    phase: 'P2.GEO-5',
    step: 'validate-osm-source',
    sourceName: 'Geofabrik Turkey OSM Extract',
    sourceUrl,
    allowedUrl: ALLOWED_SOURCE_URL,
    sourceUrlMatchesAllowed,
    expectedFormats: ['.osm.pbf (future implementation)', 'HTML source reference'],
    licenseNote: 'OpenStreetMap ODbL attribution/compliance required before broad release.',
    attribution: 'Map and geodata signals derived from OpenStreetMap contributors. Used as public context signals only.',
    metadataCheck,
    // URL rule is mandatory. HEAD reachability is best-effort and non-blocking in dry-run mode.
    sourceValidated: sourceUrlMatchesAllowed,
    officialVerification: false,
    label: 'PUBLIC_SOURCE_SIGNAL',
    generatedAt: new Date().toISOString(),
  };

  writeProof(result);
  return result;
}

async function main() {
  const result = await validateOsmSource();
  console.log(
    JSON.stringify(
      {
        step: result.step,
        sourceValidated: result.sourceValidated,
        sourceUrlMatchesAllowed: result.sourceUrlMatchesAllowed,
        metadataCheckReachable: result.metadataCheck.reachable,
        proof: 'proof/p2-geo-5-validate-osm-source-results.json',
      },
      null,
      2
    )
  );

  if (!result.sourceValidated) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(
      JSON.stringify(
        {
          step: 'validate-osm-source',
          status: 'FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        null,
        2
      )
    );
    process.exit(1);
  });
}
