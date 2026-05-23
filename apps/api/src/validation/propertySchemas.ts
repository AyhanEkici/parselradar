import { z } from "zod";
import { AssetType, InputMethod, TapuType, ZoningStatus, RoadAccess, UtilityStatus } from "@parselradar/shared";

export const PropertySubmissionCreateInputSchema = z.object({
  assetType: z.nativeEnum(AssetType),
  inputMethod: z.nativeEnum(InputMethod),
  ilanUrl: z.string().url().optional().or(z.literal("")),
  il: z.string().min(1, "City required"),
  ilce: z.string().min(1, "District required"),
  mahalleOrKoy: z.string().min(1, "Neighborhood required"),
  addressText: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  askingPriceTRY: z.coerce
    .number({ required_error: "Price required", invalid_type_error: "Price required" })
    .positive("Price must be greater than 0"),
  areaM2: z.coerce
    .number({ required_error: "Area required", invalid_type_error: "Area required" })
    .positive("Area must be greater than 0"),
  ada: z.string().optional(),
  parsel: z.string().optional(),
  pafta: z.string().optional(),
  nitelik: z.string().optional(),
  tapuType: z.nativeEnum(TapuType),
  zoningStatus: z.nativeEnum(ZoningStatus),
  taks: z.number().optional(),
  kaks: z.number().optional(),
  emsal: z.number().optional(),
  gabari: z.string().optional(),
  hmax: z.string().optional(),
  katAdedi: z.string().optional(),
  cekmeMesafeleri: z.string().optional(),
  planNotlariText: z.string().optional(),
  roadAccess: z.nativeEnum(RoadAccess),
  electricity: z.nativeEnum(UtilityStatus),
  water: z.nativeEnum(UtilityStatus),
  villageDistanceText: z.string().optional(),
  dealFlowConsentStatus: z.enum(['NOT_ASKED', 'DECLINED', 'OPTED_IN']).optional(),
  dealFlowConsentAt: z.coerce.date().optional(),
  dealFlowConsentScope: z.array(z.string()).optional(),
  professionalContactAllowed: z.boolean().optional(),
  status: z.string().optional(),
});
