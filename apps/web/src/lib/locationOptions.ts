// Location provider for Türkiye (pilot: Kayseri/Melikgazi/Gesi Cumhuriyet)
// Architecture supports future connector/import for full coverage
// sourceType: "PILOT_EMBEDDED_DATA"
// fullCoverage: false
// note: Full Türkiye mahalle dataset requires an approved/imported administrative dataset or authorized connector. This phase adds connector-ready dropdown plumbing and pilot data only.

export type Province = string;
export type District = string;
export type Neighborhood = string;

const pilotData = {
  Kayseri: {
    Melikgazi: ["Gesi Cumhuriyet"]
  }
};

export function getProvinceOptions(): Province[] {
  return Object.keys(pilotData);
}

export function getDistrictOptions(province: Province): District[] {
  if (!province || !pilotData[province]) return [];
  return Object.keys(pilotData[province]);
}

export function getNeighborhoodOptions(province: Province, district: District): Neighborhood[] {
  if (!province || !district || !pilotData[province] || !pilotData[province][district]) return [];
  return pilotData[province][district];
}

export function normalizeLocationInput(input: string): string {
  // Placeholder for future normalization logic
  return input.trim();
}

export const locationProviderMeta = {
  sourceType: "PILOT_EMBEDDED_DATA",
  fullCoverage: false,
  note:
    "Full Türkiye mahalle dataset requires an approved/imported administrative dataset or authorized connector. This phase adds connector-ready dropdown plumbing and pilot data only."
};
