// importKayseriLocations: Governed Kayseri location import/cache script
import { writeKayseriLocationCache, writeKayseriLocationImportStatus } from '../src/connectors/location/KayseriLocationImportService';
import { KayseriLocationRecord, KayseriLocationImportStatus, LocationImportSourceType } from '../src/connectors/location/LocationConnectorTypes';
import path from 'path';
import fs from 'fs';

const provinceCode = "38";
const provinceName = "Kayseri";
const coverageScope = "KAYSERI_ONLY";
const officialVerification = false;
const CACHE_PATH = path.resolve(__dirname, '../data/location/kayseri-location-cache.json');
const STATUS_PATH = path.resolve(__dirname, '../data/location/kayseri-location-import-status.json');

function now() { return new Date().toISOString(); }

function getEnv(name: string) { return process.env[name] || ''; }

async function main() {
  // 1. Discover OGC/TUCBS endpoints
  const wfsEndpoint = getEnv('CONNECTOR_TUCBS_WFS_ENDPOINT');
  const wmsEndpoint = getEnv('CONNECTOR_TUCBS_WMS_ENDPOINT');
  const arcgisEndpoint = getEnv('CONNECTOR_KAYSERI_ARCGIS_FEATURESERVER_ENDPOINT');
  const geojsonUrl = getEnv('CONNECTOR_KAYSERI_GEOJSON_URL');

  let status: KayseriLocationImportStatus;
  let records: KayseriLocationRecord[] = [];
  let queryableSourceFound = false;
  let fallbackUsed = false;
  let sourceType: LocationImportSourceType = 'NOT_CONFIGURED';
  let sourceUrl: string | undefined = undefined;

  // Prefer WFS, then ArcGIS FeatureServer, then GeoJSON
  if (wfsEndpoint) {
    // WFS endpoint present, but not implemented for real fetch in this phase
    status = {
      status: 'SOURCE_NOT_QUERYABLE',
      queryableSourceFound: false,
      cacheWritten: false,
      fallbackUsed: true,
      reason: 'WFS endpoint present but not queryable or not implemented',
      sourceUrl: wfsEndpoint,
      recordCount: 0,
      generatedAt: now()
    };
    writeKayseriLocationCache([]);
    writeKayseriLocationImportStatus(status);
    return;
  } else if (arcgisEndpoint) {
    status = {
      status: 'SOURCE_NOT_QUERYABLE',
      queryableSourceFound: false,
      cacheWritten: false,
      fallbackUsed: true,
      reason: 'ArcGIS FeatureServer endpoint present but not queryable or not implemented',
      sourceUrl: arcgisEndpoint,
      recordCount: 0,
      generatedAt: now()
    };
    writeKayseriLocationCache([]);
    writeKayseriLocationImportStatus(status);
    return;
  } else if (geojsonUrl) {
    status = {
      status: 'SOURCE_NOT_QUERYABLE',
      queryableSourceFound: false,
      cacheWritten: false,
      fallbackUsed: true,
      reason: 'GeoJSON endpoint present but not queryable or not implemented',
      sourceUrl: geojsonUrl,
      recordCount: 0,
      generatedAt: now()
    };
    writeKayseriLocationCache([]);
    writeKayseriLocationImportStatus(status);
    return;
  } else if (wmsEndpoint) {
    status = {
      status: 'SOURCE_NOT_QUERYABLE',
      queryableSourceFound: false,
      cacheWritten: false,
      fallbackUsed: true,
      reason: 'WMS-only source is not queryable for location import',
      sourceUrl: wmsEndpoint,
      recordCount: 0,
      generatedAt: now()
    };
    writeKayseriLocationCache([]);
    writeKayseriLocationImportStatus(status);
    return;
  } else {
    // No usable endpoint
    status = {
      status: 'NOT_CONFIGURED',
      queryableSourceFound: false,
      cacheWritten: false,
      fallbackUsed: true,
      reason: 'No queryable Kayseri location source configured',
      recordCount: 0,
      generatedAt: now()
    };
    writeKayseriLocationCache([]);
    writeKayseriLocationImportStatus(status);
    return;
  }
}

main().catch((err) => {
  const status: KayseriLocationImportStatus = {
    status: 'FAILED',
    queryableSourceFound: false,
    cacheWritten: false,
    fallbackUsed: true,
    reason: String(err),
    recordCount: 0,
    generatedAt: now()
  };
  writeKayseriLocationCache([]);
  writeKayseriLocationImportStatus(status);
  process.exit(1);
});
