import fs from 'fs';

function checkFile(path: string, required: boolean = true) {
  if (!fs.existsSync(path)) {
    if (required) throw new Error(`Missing required file: ${path}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function main() {
  // Discovery proof
  const proof = checkFile('proof/p2-2h-kayseri-cbs-runtime-endpoint-discovery.json');
  if (!proof.pageChecked) throw new Error('pageChecked missing');
  if (!Array.isArray(proof.scriptAssetsChecked)) throw new Error('scriptAssetsChecked missing');
  if (!Array.isArray(proof.candidateEndpointsFound)) throw new Error('candidateEndpointsFound missing');
  if (!Array.isArray(proof.candidateLayersChecked)) throw new Error('candidateLayersChecked missing');
  if (typeof proof.queryableLocationLayerFound !== 'boolean') throw new Error('queryableLocationLayerFound missing');
  if (!('importStatus' in proof)) throw new Error('importStatus missing');
  if (!('cacheWritten' in proof)) throw new Error('cacheWritten missing');
  if (!('recordCount' in proof)) throw new Error('recordCount missing');
  if (!('fallbackUsed' in proof)) throw new Error('fallbackUsed missing');
  if (!proof.noWebpageTextDataset) throw new Error('noWebpageTextDataset must be true');
  if (!proof.noWmsOnlyImport) throw new Error('noWmsOnlyImport must be true');
  if (!proof.noOfficialVerificationClaimAdded) throw new Error('noOfficialVerificationClaimAdded must be true');
  if (!proof.noScrapingAdded) throw new Error('noScrapingAdded must be true');
  if (!proof.noFullKayseriCoverageClaimWithoutProof) throw new Error('noFullKayseriCoverageClaimWithoutProof must be true');

  // If imported, check cache
  if (proof.importStatus === 'IMPORTED') {
    const cache = checkFile('apps/api/data/location/kayseri-location-cache.json');
    if (!Array.isArray(cache) || cache.length === 0) throw new Error('Cache must have records if imported');
    for (const rec of cache) {
      if (!rec.provinceCode || !rec.provinceName || !rec.districtName || !rec.neighborhoodName) {
        throw new Error('Imported record missing required attributes');
      }
    }
    if (proof.officialVerification) throw new Error('officialVerification must be false');
  } else {
    // If not imported, fallback must be true and cache must be empty
    if (!proof.fallbackUsed) throw new Error('fallbackUsed must be true');
    const cache = checkFile('apps/api/data/location/kayseri-location-cache.json');
    if (Array.isArray(cache) && cache.length > 0) throw new Error('Cache must be empty if not imported');
  }

  // No WMS-only import, no webpage text, no scraping, no unverifiable claims
  // Dashboard/NewProperty must still use provider (manual check)
  // Existing P2.2F/P2.2G contracts must still pass (run as separate gates)

  console.log('P2.2H Kayseri CBS runtime endpoint discovery verifier: PASS');
}

main();
