// LocationConnectorTypes for governed Kayseri location import

export type LocationImportSourceType =
  | "OGC_WFS"
  | "ARCGIS_FEATURE_SERVER"
  | "GEOJSON"
  | "TUCBS_UCBP"
  | "PILOT_FALLBACK"
  | "NOT_CONFIGURED"
  | "NOT_QUERYABLE";

export interface KayseriLocationRecord {
  provinceCode: "38";
  provinceName: "Kayseri";
  districtName: string;
  neighborhoodName: string;
  sourceType: LocationImportSourceType;
  sourceUrl?: string;
  importedAt: string;
  fullCoverage: boolean;
  coverageScope: "KAYSERI_ONLY";
  officialVerification: false;
}

export interface KayseriLocationImportStatus {
  status: "IMPORTED" | "NOT_CONFIGURED" | "SOURCE_NOT_QUERYABLE" | "FAILED";
  queryableSourceFound: boolean;
  cacheWritten: boolean;
  fallbackUsed: boolean;
  reason?: string;
  sourceUrl?: string;
  recordCount: number;
  generatedAt: string;
}
