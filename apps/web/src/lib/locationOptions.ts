// Location provider for Türkiye (pilot: Kayseri/Melikgazi/Gesi Cumhuriyet)
// Architecture supports governed connector/import for full coverage
// This phase: prefer imported Kayseri cache if available, fallback to pilot

export type Province = string;
export type District = string;
export type Neighborhood = string;

const pilotData = {
  Kayseri: {
    Melikgazi: ["Gesi Cumhuriyet"]
  }
};

let importedData: Record<string, Record<string, string[]>> | null = null;
let importStatus: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  importedData = require("../../api/data/location/kayseri-location-cache.json");
  if (Array.isArray(importedData) && importedData.length > 0) {
    // Convert normalized array to nested object: { [province]: { [district]: [neighborhoods] } }
    const nested: Record<string, Record<string, string[]>> = {};
    for (const rec of importedData) {
      if (rec.provinceName && rec.districtName && rec.neighborhoodName) {
        if (!nested[rec.provinceName]) nested[rec.provinceName] = {};
        if (!nested[rec.provinceName][rec.districtName]) nested[rec.provinceName][rec.districtName] = [];
        nested[rec.provinceName][rec.districtName].push(rec.neighborhoodName);
      }
    }
    importedData = nested;
  } else {
    importedData = null;
  }
} catch { importedData = null; }
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  importStatus = require("../../api/data/location/kayseri-location-import-status.json");
} catch { importStatus = null; }

function getActiveData() {
  return importedData && Object.keys(importedData).length > 0 ? importedData : pilotData;
}

export function getProvinceOptions(): Province[] {
  return Object.keys(getActiveData());
}

export function getDistrictOptions(province: Province): District[] {
  const data = getActiveData();
  if (!province || !data[province]) return [];
  return Object.keys(data[province]);
}

export function getNeighborhoodOptions(province: Province, district: District): Neighborhood[] {
  const data = getActiveData();
  if (!province || !district || !data[province] || !data[province][district]) return [];
  return data[province][district];
}

export function normalizeLocationInput(input: string): string {
  return input.trim();
}

export function getLocationCoverageStatus() {
  if (importedData && Object.keys(importedData).length > 0 && importStatus && importStatus.status === "IMPORTED") {
    return {
      source: "CACHE",
      fullCoverage: !!importStatus.fullCoverage,
      coverageScope: "KAYSERI_ONLY",
      note: "Full Türkiye mahalle dataset requires an approved/imported administrative dataset or authorized connector. This phase adds connector-ready dropdown plumbing and pilot data only."
    };
  }
  return {
    source: "PILOT_FALLBACK",
    fullCoverage: false,
    coverageScope: "KAYSERI_ONLY",
    note: "Full Türkiye mahalle dataset requires an approved/imported administrative dataset or authorized connector. This phase adds connector-ready dropdown plumbing and pilot data only."
  };
}
