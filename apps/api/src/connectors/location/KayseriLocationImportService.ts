// KayseriLocationImportService for governed Kayseri location import
import { KayseriLocationRecord, KayseriLocationImportStatus, LocationImportSourceType } from "./LocationConnectorTypes";
import fs from "fs";
import path from "path";

const CACHE_PATH = path.resolve(__dirname, "../../../data/location/kayseri-location-cache.json");
const STATUS_PATH = path.resolve(__dirname, "../../../data/location/kayseri-location-import-status.json");

export function writeKayseriLocationCache(records: KayseriLocationRecord[]) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(records, null, 2));
}

export function writeKayseriLocationImportStatus(status: KayseriLocationImportStatus) {
  fs.writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2));
}

export function readKayseriLocationCache(): KayseriLocationRecord[] | null {
  if (!fs.existsSync(CACHE_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
  } catch {
    return null;
  }
}

export function readKayseriLocationImportStatus(): KayseriLocationImportStatus | null {
  if (!fs.existsSync(STATUS_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(STATUS_PATH, "utf-8"));
  } catch {
    return null;
  }
}
