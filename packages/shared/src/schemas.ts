// ...existing code...
// Zod schemas for ParselRadar shared types
import { z } from 'zod';
import {
  AssetType,
  InputMethod,
  TapuType,
  ZoningStatus,
  RoadAccess,
  UtilityStatus,
  DocumentType,
  ProductType,
  Signal,
  CreditLedgerType,
  DealPoolStatus,
  MatchCategory,
} from './enums';

export const UserSchema = z.object({
  email: z.string().email(),
  passwordHash: z.string(),
  name: z.string(),
  role: z.enum(['USER', 'ADMIN']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreditLedgerSchema = z.object({
  userId: z.string(),
  type: z.nativeEnum(CreditLedgerType),
  amount: z.number(),
  reason: z.string().optional(),
  relatedEntityId: z.string().optional(),
  stripeCheckoutSessionId: z.string().optional(),
  stripePaymentIntentId: z.string().optional(),
  createdAt: z.date(),
});

export const StripeCheckoutSessionSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  creditAmount: z.number(),
  status: z.enum(['PENDING', 'PAID', 'EXPIRED', 'CANCELLED']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Input schema for client POST /properties
export const PropertySubmissionCreateSchema = z.object({
  assetType: z.nativeEnum(AssetType),
  inputMethod: z.nativeEnum(InputMethod),
  ilanUrl: z.string().url().optional().or(z.literal("")),
  il: z.string().min(1),
  ilce: z.string().min(1),
  mahalleOrKoy: z.string().min(1),
  addressText: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  askingPriceTRY: z.number().positive().optional(),
  areaM2: z.number().positive().optional(),
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
  status: z.string().optional(),
});

// Internal schema for DB/document shape
export const PropertySubmissionSchema = z.object({
  userId: z.string(),
  assetType: z.nativeEnum(AssetType),
  inputMethod: z.nativeEnum(InputMethod),
  ilanUrl: z.string().optional(),
  il: z.string(),
  ilce: z.string(),
  mahalleOrKoy: z.string(),
  addressText: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  askingPriceTRY: z.number().optional(),
  areaM2: z.number().optional(),
  pricePerM2: z.number().optional(),
  ada: z.string().optional(),
  parsel: z.string().optional(),
  pafta: z.string().optional(),
  nitelik: z.string().optional(),
  tapuType: z.nativeEnum(TapuType),
  zoningStatus: z.nativeEnum(ZoningStatus),
  taks: z.string().optional(),
  kaks: z.string().optional(),
  emsal: z.string().optional(),
  gabari: z.string().optional(),
  hmax: z.string().optional(),
  katAdedi: z.string().optional(),
  cekmeMesafeleri: z.string().optional(),
  planNotlariText: z.string().optional(),
  roadAccess: z.nativeEnum(RoadAccess),
  electricity: z.nativeEnum(UtilityStatus),
  water: z.nativeEnum(UtilityStatus),
  villageDistanceText: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const DocumentUploadSchema = z.object({
  propertySubmissionId: z.string(),
  userId: z.string(),
  documentType: z.nativeEnum(DocumentType),
  originalName: z.string(),
  storedPath: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  uploadedAt: z.date(),
});

export const ConsentRecordSchema = z.object({
  propertySubmissionId: z.string(),
  userId: z.string(),
  termsAccepted: z.boolean(),
  privacyAccepted: z.boolean(),
  allowAnonymizedMarketAnalytics: z.boolean().optional(),
  allowDealPoolEvaluation: z.boolean().optional(),
  allowContactForMatching: z.boolean().optional(),
  allowShareWithLicensedAgents: z.boolean().optional(),
  allowShareWithDevelopersContractors: z.boolean().optional(),
  createdAt: z.date(),
});

export const AnalysisRunSchema = z.object({
  propertySubmissionId: z.string(),
  userId: z.string(),
  productType: z.nativeEnum(ProductType),
  score: z.number(),
  signal: z.nativeEnum(Signal),
  riskFlags: z.array(z.string()),
  missingInfo: z.array(z.string()),
  assumptions: z.array(z.string()),
  unverifiableInfo: z.array(z.string()),
  previewSummary: z.record(z.unknown()),
  fullAnalysis: z.record(z.unknown()),
  createdAt: z.date(),
});

export const ReportSchema = z.object({
  analysisRunId: z.string(),
  propertySubmissionId: z.string(),
  userId: z.string(),
  reportType: z.string(),
  pdfPath: z.string(),
  creditsCharged: z.number(),
  createdAt: z.date(),
});

export const DealPoolEntrySchema = z.object({
  propertySubmissionId: z.string(),
  userId: z.string(),
  status: z.nativeEnum(DealPoolStatus),
  matchCategories: z.array(z.nativeEnum(MatchCategory)),
  adminNotes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const DealShareAuditSchema = z.object({
  dealPoolEntryId: z.string(),
  sharedWithType: z.string(),
  sharedWithName: z.string(),
  sharedWithContact: z.string(),
  sharedFields: z.record(z.unknown()),
  adminUserId: z.string(),
  createdAt: z.date(),
});
