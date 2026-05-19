"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertySubmissionCreateInputSchema = void 0;
const zod_1 = require("zod");
const shared_1 = require("@parselradar/shared");
exports.PropertySubmissionCreateInputSchema = zod_1.z.object({
    assetType: zod_1.z.nativeEnum(shared_1.AssetType),
    inputMethod: zod_1.z.nativeEnum(shared_1.InputMethod),
    ilanUrl: zod_1.z.string().url().optional().or(zod_1.z.literal("")),
    il: zod_1.z.string().min(1, "City required"),
    ilce: zod_1.z.string().min(1, "District required"),
    mahalleOrKoy: zod_1.z.string().min(1, "Neighborhood required"),
    addressText: zod_1.z.string().optional(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    askingPriceTRY: zod_1.z.coerce
        .number({ required_error: "Price required", invalid_type_error: "Price required" })
        .positive("Price must be greater than 0"),
    areaM2: zod_1.z.coerce
        .number({ required_error: "Area required", invalid_type_error: "Area required" })
        .positive("Area must be greater than 0"),
    ada: zod_1.z.string().optional(),
    parsel: zod_1.z.string().optional(),
    pafta: zod_1.z.string().optional(),
    nitelik: zod_1.z.string().optional(),
    tapuType: zod_1.z.nativeEnum(shared_1.TapuType),
    zoningStatus: zod_1.z.nativeEnum(shared_1.ZoningStatus),
    taks: zod_1.z.number().optional(),
    kaks: zod_1.z.number().optional(),
    emsal: zod_1.z.number().optional(),
    gabari: zod_1.z.string().optional(),
    hmax: zod_1.z.string().optional(),
    katAdedi: zod_1.z.string().optional(),
    cekmeMesafeleri: zod_1.z.string().optional(),
    planNotlariText: zod_1.z.string().optional(),
    roadAccess: zod_1.z.nativeEnum(shared_1.RoadAccess),
    electricity: zod_1.z.nativeEnum(shared_1.UtilityStatus),
    water: zod_1.z.nativeEnum(shared_1.UtilityStatus),
    villageDistanceText: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
