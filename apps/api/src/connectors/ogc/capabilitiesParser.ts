import { OgcLayerRecord } from './ogcTypes';

function parseTagValue(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = block.match(re);
  return match ? String(match[1] || '').trim() : null;
}

function parseTagValues(block: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const values: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(block)) !== null) {
    const value = String(match[1] || '').trim();
    if (value) values.push(value);
  }
  return Array.from(new Set(values));
}

function parseBbox(block: string) {
  const geo = block.match(/<EX_GeographicBoundingBox>[\s\S]*?<westBoundLongitude>([^<]+)<\/westBoundLongitude>[\s\S]*?<southBoundLatitude>([^<]+)<\/southBoundLatitude>[\s\S]*?<eastBoundLongitude>([^<]+)<\/eastBoundLongitude>[\s\S]*?<northBoundLatitude>([^<]+)<\/northBoundLatitude>[\s\S]*?<\/EX_GeographicBoundingBox>/i);
  if (geo) {
    return {
      minx: Number(geo[1]),
      miny: Number(geo[2]),
      maxx: Number(geo[3]),
      maxy: Number(geo[4]),
      crs: 'EPSG:4326',
    };
  }

  const bbox = block.match(/<BoundingBox[^>]*(CRS|SRS)=\"([^\"]+)\"[^>]*minx=\"([^\"]+)\"[^>]*miny=\"([^\"]+)\"[^>]*maxx=\"([^\"]+)\"[^>]*maxy=\"([^\"]+)\"[^>]*\/?>/i);
  if (bbox) {
    return {
      minx: Number(bbox[3]),
      miny: Number(bbox[4]),
      maxx: Number(bbox[5]),
      maxy: Number(bbox[6]),
      crs: bbox[2],
    };
  }

  return undefined;
}

function parseWmsFormats(xml: string): string[] {
  const sectionMatch = xml.match(/<GetMap>[\s\S]*?<\/GetMap>/i);
  if (!sectionMatch) return [];
  return parseTagValues(sectionMatch[0], 'Format');
}

function parseWmtsFormats(xml: string): string[] {
  const values = parseTagValues(xml, 'Format');
  return Array.from(new Set(values.filter((value) => value.includes('/'))));
}

function parseWfsFormats(xml: string): string[] {
  const values = parseTagValues(xml, 'ResultFormat');
  return Array.from(new Set(values));
}

function splitLayerBlocks(xml: string): string[] {
  const blocks: string[] = [];
  const re = /<Layer\b[\s\S]*?<\/Layer>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    blocks.push(match[0]);
  }
  return blocks;
}

export function parseWmsCapabilities(xml: string, provider: string): { layers: OgcLayerRecord[]; formats: string[]; projections: string[] } {
  const layerBlocks = splitLayerBlocks(xml);
  const formats = parseWmsFormats(xml);
  const layers: OgcLayerRecord[] = [];

  for (const block of layerBlocks) {
    const name = parseTagValue(block, 'Name');
    if (!name) continue;

    const title = parseTagValue(block, 'Title') || name;
    const projection = Array.from(new Set([...parseTagValues(block, 'CRS'), ...parseTagValues(block, 'SRS')]));
    const styles = parseTagValues(block, 'Style').length > 0 ? parseTagValues(block, 'Name') : [];

    layers.push({
      id: `${provider}:WMS:${name}`,
      provider,
      service: 'WMS',
      name,
      title,
      projection,
      bbox: parseBbox(block),
      format: formats,
      styles,
      visibility: false,
      opacity: 1,
      healthState: 'HEALTHY',
      readOnly: true,
    });
  }

  const projections = Array.from(new Set(layers.flatMap((layer) => layer.projection))).filter(Boolean);
  return { layers, formats, projections };
}

export function parseWmtsCapabilities(xml: string, provider: string): { layers: OgcLayerRecord[]; formats: string[]; projections: string[] } {
  const formats = parseWmtsFormats(xml);
  const layers: OgcLayerRecord[] = [];
  const re = /<Layer\b[\s\S]*?<Identifier>([^<]+)<\/Identifier>[\s\S]*?<Title>([^<]+)<\/Title>[\s\S]*?<\/Layer>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    const name = String(match[1] || '').trim();
    if (!name) continue;
    const title = String(match[2] || '').trim() || name;
    layers.push({
      id: `${provider}:WMTS:${name}`,
      provider,
      service: 'WMTS',
      name,
      title,
      projection: [],
      format: formats,
      styles: [],
      visibility: false,
      opacity: 1,
      healthState: 'HEALTHY',
      readOnly: true,
    });
  }

  return { layers, formats, projections: [] };
}

export function parseWfsCapabilities(xml: string, provider: string): { layers: OgcLayerRecord[]; formats: string[]; projections: string[] } {
  const formats = parseWfsFormats(xml);
  const layers: OgcLayerRecord[] = [];
  const re = /<FeatureType\b[\s\S]*?<Name>([^<]+)<\/Name>[\s\S]*?<Title>([^<]+)<\/Title>[\s\S]*?<\/FeatureType>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    const name = String(match[1] || '').trim();
    if (!name) continue;
    const title = String(match[2] || '').trim() || name;
    layers.push({
      id: `${provider}:WFS:${name}`,
      provider,
      service: 'WFS',
      name,
      title,
      projection: [],
      format: formats,
      styles: [],
      visibility: false,
      opacity: 1,
      healthState: 'HEALTHY',
      readOnly: true,
    });
  }

  return { layers, formats, projections: [] };
}
