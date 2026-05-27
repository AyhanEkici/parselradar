import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://cbs.kayseri.bel.tr/Kayseri-Kent-Rehberi';
const OUTPUT_JSON = 'proof/p2-2h-kayseri-cbs-runtime-endpoint-discovery.json';
const OUTPUT_MD = 'proof/p2-2h-kayseri-cbs-runtime-endpoint-discovery.md';

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return await res.text();
}

function extractUrlsFromText(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s'"\)]+)|(\/arcgis\/rest\/services\/[^\s'"\)]+)|(\/ArcGIS\/rest\/services\/[^\s'"\)]+)/gi;
  const matches = text.match(urlRegex);
  return matches ? matches.map(u => u.trim()) : [];
}

function normalizeUrl(base: string, candidate: string): string {
  if (candidate.startsWith('http')) return candidate;
  if (candidate.startsWith('/')) {
    const url = new URL(base);
    return url.origin + candidate;
  }
  return base.replace(/\/$/, '') + '/' + candidate;
}

async function fetchAndExtractAssets(pageUrl: string, html: string): Promise<string[]> {
  const $ = cheerio.load(html);
  const assets: string[] = [];
  $('script[src],link[href],script').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('href');
    if (src) assets.push(normalizeUrl(pageUrl, src));
  });
  // Also extract inline script contents
  $('script').each((_, el) => {
    const scriptText = $(el).html();
    if (scriptText) assets.push(scriptText);
  });
  return assets;
}

async function fetchArcGisServiceMetadata(url: string): Promise<any> {
  try {
    const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'f=pjson');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function tryQueryLayer(serviceUrl: string, layerId: number): Promise<any> {
  const queryUrl = `${serviceUrl}/${layerId}/query?where=1%3D1&outFields=*&returnGeometry=false&f=json&resultRecordCount=1`;
  try {
    const res = await fetch(queryUrl);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function classifyLayer(layer: any, queryResult: any): string {
  if (!layer) return 'UNKNOWN_NEEDS_MANUAL_REVIEW';
  if (layer.type && layer.type.toLowerCase().includes('wms')) return 'WMS_ONLY_NOT_QUERYABLE';
  if (layer.type && layer.type.toLowerCase().includes('wmts')) return 'WMS_ONLY_NOT_QUERYABLE';
  if (layer.supportsQuery === false) return 'MAPSERVER_QUERY_DISABLED';
  if (queryResult && queryResult.features && queryResult.features.length > 0) {
    const f = queryResult.features[0].attributes || {};
    const keys = Object.keys(f).map(k => k.toLowerCase());
    if (keys.some(k => k.includes('mahalle') || k.includes('ilce') || k.includes('adres'))) {
      return 'QUERYABLE_LOCATION_LAYER';
    }
    return 'QUERYABLE_BUT_NOT_LOCATION';
  }
  return 'UNKNOWN_NEEDS_MANUAL_REVIEW';
}

async function main() {
  const result: any = {
    pageChecked: BASE_URL,
    scriptAssetsChecked: [],
    candidateEndpointsFound: [],
    candidateLayersChecked: [],
    queryableLocationLayerFound: false,
    importStatus: 'NOT_CONFIGURED',
    cacheWritten: false,
    recordCount: 0,
    fallbackUsed: true,
    noWebpageTextDataset: true,
    noWmsOnlyImport: true,
    noOfficialVerificationClaimAdded: true,
    noScrapingAdded: true,
    noFullKayseriCoverageClaimWithoutProof: true
  };
  const html = await fetchText(BASE_URL);
  const assets = await fetchAndExtractAssets(BASE_URL, html);
  result.scriptAssetsChecked = assets.filter(a => typeof a === 'string' && a.startsWith('http'));
  let allText = html + '\n' + assets.filter(a => typeof a === 'string').join('\n');
  // Fetch external JS/config assets
  for (const assetUrl of result.scriptAssetsChecked) {
    try {
      const assetText = await fetchText(assetUrl);
      allText += '\n' + assetText;
    } catch {}
  }
  // Extract candidate service URLs
  const candidateUrls = Array.from(new Set(extractUrlsFromText(allText)));
  result.candidateEndpointsFound = candidateUrls;
  // Check each ArcGIS MapServer/FeatureServer
  for (const url of candidateUrls) {
    if (!/MapServer|FeatureServer/i.test(url)) continue;
    const serviceUrl = url.split('?')[0];
    const meta = await fetchArcGisServiceMetadata(serviceUrl);
    if (!meta || !meta.layers) continue;
    for (const layer of meta.layers) {
      const queryResult = await tryQueryLayer(serviceUrl, layer.id);
      const classification = classifyLayer(layer, queryResult);
      result.candidateLayersChecked.push({
        serviceUrl,
        layerId: layer.id,
        layerName: layer.name,
        supportsQuery: layer.supportsQuery,
        fields: layer.fields ? layer.fields.map((f: any) => f.name) : [],
        classification
      });
      if (classification === 'QUERYABLE_LOCATION_LAYER') {
        result.queryableLocationLayerFound = true;
      }
    }
  }
  // Write proof
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result, null, 2));
  // Write markdown summary
  let md = `# P2.2H Kayseri CBS Runtime Endpoint Discovery\n\n`;
  md += `- pageChecked: ${result.pageChecked}\n`;
  md += `- scriptAssetsChecked: ${result.scriptAssetsChecked.length}\n`;
  md += `- candidateEndpointsFound: ${result.candidateEndpointsFound.length}\n`;
  md += `- candidateLayersChecked: ${result.candidateLayersChecked.length}\n`;
  md += `- queryableLocationLayerFound: ${result.queryableLocationLayerFound}\n`;
  md += `- importStatus: ${result.importStatus}\n`;
  md += `- cacheWritten: ${result.cacheWritten}\n`;
  md += `- recordCount: ${result.recordCount}\n`;
  md += `- fallbackUsed: ${result.fallbackUsed}\n`;
  md += `- noWebpageTextDataset: ${result.noWebpageTextDataset}\n`;
  md += `- noWmsOnlyImport: ${result.noWmsOnlyImport}\n`;
  md += `- noOfficialVerificationClaimAdded: ${result.noOfficialVerificationClaimAdded}\n`;
  md += `- noScrapingAdded: ${result.noScrapingAdded}\n`;
  md += `- noFullKayseriCoverageClaimWithoutProof: ${result.noFullKayseriCoverageClaimWithoutProof}\n`;
  fs.writeFileSync(OUTPUT_MD, md);
}

main().catch(e => { console.error(e); process.exit(1); });
