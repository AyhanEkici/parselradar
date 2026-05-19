"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyById = exports.getMyProperties = exports.createProperty = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const auditLog_1 = require("../utils/auditLog");
const authUser_1 = require("../utils/authUser");
const PropertySubmission_1 = __importDefault(require("../models/PropertySubmission"));
const DocumentUpload_1 = __importDefault(require("../models/DocumentUpload"));
const AnalysisRun_1 = __importDefault(require("../models/AnalysisRun"));
const AuditEvent_1 = __importDefault(require("../models/AuditEvent"));
const User_1 = __importDefault(require("../models/User"));
const propertySchemas_1 = require("../validation/propertySchemas");
const ownership_1 = require("../utils/ownership");
const scopeFilters_1 = require("../utils/scopeFilters");
const toGridFsUrls = (propertyId, documentId) => ({
    fileUrl: `/properties/${propertyId}/documents/${documentId}/view`,
    downloadUrl: `/properties/${propertyId}/documents/${documentId}/download`,
});
const mapCreationSource = (inputMethod) => {
    const value = String(inputMethod || '').toUpperCase();
    if (value.includes('URL') || value.includes('IMPORT'))
        return 'IMPORT';
    if (value.includes('API'))
        return 'API';
    if (value.includes('SCRAP'))
        return 'SCRAPER';
    return 'MANUAL_ENTRY';
};
const createProperty = async (req, res) => {
    try {
        const user = (0, authUser_1.requireAuthUser)(req);
        const parsed = propertySchemas_1.PropertySubmissionCreateInputSchema.safeParse(req.body);
        if (!parsed.success) {
            const fields = {};
            for (const issue of parsed.error.issues) {
                const key = String(issue.path[0] || 'form');
                if (!fields[key])
                    fields[key] = issue.message;
            }
            await (0, auditLog_1.logAuditEvent)({
                type: 'property_create',
                actorUserId: user._id.toString(),
                actorRole: user.role,
                targetType: 'User',
                targetId: user._id.toString(),
                message: 'Property create failed: invalid data',
                metadata: { errors: parsed.error.errors },
                ip: req.ip,
                userAgent: req.get('user-agent'),
                success: false,
            });
            return res.status(400).json({ error: 'Validation failed', fields });
        }
        const input = parsed.data;
        const doc = { ...input, userId: user._id };
        const askingPrice = Number(input.askingPriceTRY);
        const area = Number(input.areaM2);
        if (Number.isFinite(askingPrice) &&
            Number.isFinite(area) &&
            area > 0) {
            doc.pricePerM2 = askingPrice / area;
        }
        // createdAt/updatedAt handled by Mongoose timestamps
        const property = await PropertySubmission_1.default.create(doc);
        await (0, auditLog_1.logAuditEvent)({
            type: 'property_create',
            actorUserId: user._id.toString(),
            actorRole: user.role,
            targetType: 'PropertySubmission',
            targetId: property._id.toString(),
            message: 'Property created',
            metadata: { propertyId: property._id.toString() },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            success: true,
        });
        res.json(property);
    }
    catch (err) {
        if (err.name === 'ValidationError') {
            const fields = {};
            Object.keys(err.errors || {}).forEach((key) => {
                fields[key] = err.errors[key]?.message || 'Invalid value';
            });
            await (0, auditLog_1.logAuditEvent)({
                type: 'property_create',
                actorUserId: undefined,
                actorRole: undefined,
                targetType: 'PropertySubmission',
                targetId: undefined,
                message: 'Property create failed: mongoose validation',
                metadata: { error: err.errors },
                ip: req.ip,
                userAgent: req.get('user-agent'),
                success: false,
            });
            return res.status(400).json({ error: 'Validation failed', fields });
        }
        console.error('Property creation error:', err);
        await (0, auditLog_1.logAuditEvent)({
            type: 'property_create',
            actorUserId: undefined,
            actorRole: undefined,
            targetType: 'PropertySubmission',
            targetId: undefined,
            message: 'Property create failed: server error',
            metadata: { error: err.message },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            success: false,
        });
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createProperty = createProperty;
const getMyProperties = async (req, res) => {
    const user = (0, authUser_1.requireAuthUser)(req);
    const properties = await PropertySubmission_1.default.find((0, scopeFilters_1.propertyOwnerScope)(user, {})).sort({ createdAt: -1 });
    res.json(properties);
};
exports.getMyProperties = getMyProperties;
const getPropertyById = async (req, res) => {
    const user = (0, authUser_1.requireAuthUser)(req);
    const { propertyId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({ error: 'Geçersiz propertyId' });
    }
    const property = await PropertySubmission_1.default.findById(propertyId).lean();
    if (!property) {
        return res.status(404).json({ error: 'Mülk bulunamadı' });
    }
    try {
        (0, ownership_1.assertOwnerOrAdmin)({ userId: property.userId }, user);
    }
    catch {
        return res.status(404).json({ error: 'Mülk bulunamadı' });
    }
    const [owner, documents, analyses, audits] = await Promise.all([
        User_1.default.findById(property.userId).select('email name role').lean(),
        DocumentUpload_1.default.find({ propertySubmissionId: property._id })
            .sort({ uploadedAt: -1 })
            .select('documentType originalName storedName storedPath gridFsFileId uploadedAt mimeType sizeBytes')
            .lean(),
        AnalysisRun_1.default.find({ propertySubmissionId: property._id })
            .sort({ createdAt: -1 })
            .select('productType score signal confidence strengths risks missingInputs recommendation factorsUsed createdAt previewSummary fullAnalysis')
            .lean(),
        AuditEvent_1.default.find({
            $or: [
                { targetId: String(property._id) },
                { 'metadata.propertyId': String(property._id) },
            ],
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('type message success createdAt')
            .lean(),
    ]);
    const enrichedAnalyses = analyses.map((analysis) => {
        const full = (analysis.fullAnalysis || {});
        return {
            ...analysis,
            recommendations: full.recommendations || [],
            valuationBand: full.valuationBand,
            marketPosition: full.marketPosition,
            developerFit: full.developerFit,
            zoningPotential: full.zoningPotential,
            liquiditySignal: full.liquiditySignal,
            comparableCount: full.comparableCount,
            avgComparablePricePerM2: full.avgComparablePricePerM2,
            marketHeat: full.marketHeat,
            pricingPosition: full.pricingPosition,
            opportunitySignals: full.opportunitySignals || [],
            overpricingRisk: full.overpricingRisk,
            comparableSummary: full.comparableSummary,
            topComparables: full.topComparables || [],
            infrastructureScore: full.infrastructureScore,
            roadAccessScore: full.roadAccessScore,
            utilityCoverage: full.utilityCoverage,
            growthPotential: full.growthPotential,
            regionalDemand: full.regionalDemand,
            strategicLocationSignals: full.strategicLocationSignals || [],
            geoSummary: full.geoSummary,
            subdivisionPotential: full.subdivisionPotential,
            frontageDepthScore: full.frontageDepthScore,
            densityPotential: full.densityPotential,
            developerROI: full.developerROI,
            parcelMergeOpportunity: full.parcelMergeOpportunity,
            rezoningUpside: full.rezoningUpside,
            projectability: full.projectability,
            developmentScenario: full.developmentScenario || [],
            developmentSignals: full.developmentSignals || [],
            coordinates: full.coordinates,
            nearbyInfrastructure: full.nearbyInfrastructure || [],
            infrastructureDistances: full.infrastructureDistances || {},
            spatialSignals: full.spatialSignals || [],
            spatialLiquidity: full.spatialLiquidity,
            clusterStrength: full.clusterStrength,
            geoConfidence: full.geoConfidence,
            mapSummary: full.mapSummary,
            comparableMapPoints: full.comparableMapPoints || [],
            regionalCluster: full.regionalCluster,
            analysisVersion: analysis.analysisVersion || full.analysisVersion,
            refreshReason: analysis.refreshReason || full.refreshReason,
            sourceConfidence: analysis.sourceConfidence || full.sourceConfidence,
            cacheTimestamp: analysis.cacheTimestamp || full.cacheTimestamp,
            refreshStatus: full.refreshStatus,
            freshnessScore: full.freshnessScore,
            ingestionSignals: full.ingestionSignals || [],
            staleFlags: full.staleFlags || [],
            cacheState: full.cacheState,
            trendSignals: full.trendSignals || [],
            marketMomentum: full.marketMomentum,
            volatilityIndex: full.volatilityIndex,
            investorSignal: full.investorSignal,
            connectorStatus: full.connectorStatus,
            districtHeat: full.districtHeat,
            opportunityScore: full.opportunityScore,
            trendVelocity: full.trendVelocity,
            liquidityTrend: full.liquidityTrend,
            alertSignals: full.alertSignals || [],
            governanceEnvelope: full.governanceEnvelope,
            governanceClassification: full.governanceEnvelope?.governanceClassification,
            trustScore: full.governanceEnvelope?.trustScore,
            reportEvidenceSummary: full.governanceEnvelope?.evidenceSummary,
            reportConfidenceSummary: full.governanceEnvelope?.confidenceSummary,
            reportDisclosureSummary: full.governanceEnvelope?.disclosureSummary,
            evidenceTrace: full.governanceEnvelope?.evidenceTrace || [],
            unsupportedAssumptions: full.governanceEnvelope?.unsupportedAssumptions || [],
            speculativeIndicators: full.governanceEnvelope?.speculativeIndicators || [],
            territorialIntelligence: full.territorialIntelligence,
            ingestionGovernance: full.ingestionGovernance,
            ingestionProvenanceEnvelope: full.ingestionProvenanceEnvelope,
            ingestionCompliance: full.ingestionCompliance,
            ingestionTrust: full.ingestionTrust,
            ingestionAuditTrail: full.ingestionAuditTrail,
            connectorGovernance: full.connectorGovernance,
            connectorExecutions: full.connectorExecutions || [],
            ingestionFreshnessEnvelope: full.ingestionFreshnessEnvelope,
            noFakeActiveProof: full.noFakeActiveProof,
            operationalIntelligence: full.operationalIntelligence,
            autonomyIntelligence: full.autonomyIntelligence,
            executionOperatingSystem: full.executionOperatingSystem,
        };
    });
    const latestByType = (type, altType) => enrichedAnalyses.find((a) => a.productType === type || (altType ? a.productType === altType : false)) || null;
    const latestAnalysis = enrichedAnalyses[0] || null;
    const visibleDocuments = documents.map((doc) => ({
        ...doc,
        createdAt: doc.uploadedAt,
        storedName: doc.storedName || null,
        ...(doc.gridFsFileId ? toGridFsUrls(String(property._id), String(doc._id)) : { fileUrl: null, downloadUrl: null }),
        fileMissing: !doc.gridFsFileId,
    }));
    const titleFields = {
        ownerName: owner?.name || '-',
        address: property.addressText || '-',
        city: property.il || '-',
        district: property.ilce || '-',
    };
    const generatedPropertyTitle = `${titleFields.ownerName}, ${titleFields.address}, ${titleFields.district}/${titleFields.city}`;
    return res.json({
        property,
        owner,
        creator: owner,
        creationSource: mapCreationSource(property.inputMethod),
        generatedPropertyTitle,
        titleDerivation: titleFields,
        documents: visibleDocuments,
        analyses: enrichedAnalyses,
        latestAnalysis,
        analysisSummary: {
            quickScore: latestByType('quick-score', 'QUICK_SCORE'),
            parcelInsight: latestByType('parsel-insight', 'PARSEL_INSIGHT'),
            developerFit: latestByType('developer-fit', 'DEVELOPER_FIT'),
        },
        auditReferences: audits,
    });
};
exports.getPropertyById = getPropertyById;
