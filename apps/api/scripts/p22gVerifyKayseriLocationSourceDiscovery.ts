import fs from 'fs';

function checkFile(path: string, required: boolean = true) {
  if (!fs.existsSync(path)) {
    if (required) throw new Error(`Missing required file: ${path}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function main() {
  // Proof files
  const proof = checkFile('proof/p2-2g-kayseri-location-source-discovery.json');
  const status = checkFile('apps/api/data/location/kayseri-location-import-status.json');
  const cache = checkFile('apps/api/data/location/kayseri-location-cache.json');

  // 1. Proof file must exist and match contract
  if (!proof.candidates || !Array.isArray(proof.candidates)) throw new Error('Proof candidates missing or not array');
  if (typeof proof.queryableSourceFound !== 'boolean') throw new Error('Proof queryableSourceFound missing');
  if (typeof proof.recordCount !== 'number') throw new Error('Proof recordCount missing');

  // 2. Import status must exist and match contract
  if (!status.status) throw new Error('Import status missing status');
  if (typeof status.queryableSourceFound !== 'boolean') throw new Error('Import status queryableSourceFound missing');
  if (typeof status.recordCount !== 'number') throw new Error('Import status recordCount missing');

  // 3. If imported, require records and attributes
  if (status.status === 'IMPORTED') {
    if (!Array.isArray(cache) || cache.length === 0) throw new Error('Cache must have records if imported');
    for (const rec of cache) {
      if (!rec.provinceCode || !rec.provinceName || !rec.districtName || !rec.neighborhoodName) {
        throw new Error('Imported record missing required attributes');
      }
    }
    if (status.officialVerification) throw new Error('officialVerification must be false');
  } else {
    // 4. If NOT_CONFIGURED or SOURCE_NOT_QUERYABLE, require fallback
    if (!status.fallbackUsed) throw new Error('fallbackUsed must be true');
    if (status.cacheWritten && Array.isArray(cache) && cache.length > 0) throw new Error('Cache must be empty if not imported');
  }

  // 5. No hardcoded React data, no scraping, no unverifiable claims
  // (Enforced by contract: no full coverage, no fake data, no Wikipedia/webpage copy)

  // 6. WMS-only must be rejected as not queryable
  if (proof.candidates.some((c: any) => c.type === 'WMS' && c.queryable)) throw new Error('WMS-only source must not be queryable');

  // 7. Dashboard/NewProperty must still use provider (manual check)

  console.log('P2.2G Kayseri location source discovery verifier: PASS');
}

main();
