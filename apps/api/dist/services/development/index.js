"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDevelopmentScenario = exports.calculateProjectability = exports.simulateRezoningUpside = exports.detectParcelMergeOpportunity = exports.calculateDeveloperROI = exports.calculateDensityPotential = exports.calculateFrontageDepthScore = exports.calculateSubdivisionPotential = void 0;
exports.buildDevelopmentIntelligence = buildDevelopmentIntelligence;
const calculateSubdivisionPotential_1 = require("./calculateSubdivisionPotential");
const calculateFrontageDepthScore_1 = require("./calculateFrontageDepthScore");
const calculateDensityPotential_1 = require("./calculateDensityPotential");
const calculateDeveloperROI_1 = require("./calculateDeveloperROI");
const detectParcelMergeOpportunity_1 = require("./detectParcelMergeOpportunity");
const simulateRezoningUpside_1 = require("./simulateRezoningUpside");
const calculateProjectability_1 = require("./calculateProjectability");
const buildDevelopmentScenario_1 = require("./buildDevelopmentScenario");
function buildDevelopmentIntelligence(input) {
    const subdivisionPotential = (0, calculateSubdivisionPotential_1.calculateSubdivisionPotential)({
        areaM2: input.areaM2,
        zoningStatus: input.zoningStatus,
        roadAccess: input.roadAccess,
    });
    const frontageDepthScore = (0, calculateFrontageDepthScore_1.calculateFrontageDepthScore)({
        areaM2: input.areaM2,
        roadAccess: input.roadAccess,
        addressText: input.addressText,
        mahalleOrKoy: input.mahalleOrKoy,
    });
    const densityPotential = (0, calculateDensityPotential_1.calculateDensityPotential)({
        zoningStatus: input.zoningStatus,
        areaM2: input.areaM2,
    });
    const developerROI = (0, calculateDeveloperROI_1.calculateDeveloperROI)({
        densityScore: densityPotential.score,
        demandScore: input.regionalDemandScore,
        infrastructureScore: input.infrastructureScore,
        pricingDeltaRatio: input.pricingDeltaRatio,
        frontageDepthScore: frontageDepthScore.score,
    });
    const parcelMergeOpportunity = (0, detectParcelMergeOpportunity_1.detectParcelMergeOpportunity)({
        areaM2: input.areaM2,
        district: input.district,
        zoningStatus: input.zoningStatus,
    });
    const rezoningUpside = (0, simulateRezoningUpside_1.simulateRezoningUpside)({
        zoningStatus: input.zoningStatus,
        infrastructureScore: input.infrastructureScore,
        roadAccessScore: input.roadAccessScore,
        demandScore: input.regionalDemandScore,
    });
    const projectability = (0, calculateProjectability_1.calculateProjectability)({
        densityScore: densityPotential.score,
        infrastructureScore: input.infrastructureScore,
        roadAccessScore: input.roadAccessScore,
        frontageDepthScore: frontageDepthScore.score,
        subdivisionScore: subdivisionPotential.score,
        rezoningScore: rezoningUpside.score,
    });
    const developmentScenario = (0, buildDevelopmentScenario_1.buildDevelopmentScenario)({
        subdivisionLevel: subdivisionPotential.level,
        densityCategory: densityPotential.category,
        roiScenario: developerROI.scenario,
        rezoningScenario: rezoningUpside.scenario,
        projectabilityLevel: projectability.level,
    });
    const developmentSignals = Array.from(new Set([
        ...subdivisionPotential.splitabilitySignals,
        ...frontageDepthScore.geometrySignals,
        ...densityPotential.supportingSignals,
        ...developerROI.roiSignals,
        ...parcelMergeOpportunity.signals,
        ...rezoningUpside.signals,
        ...projectability.blockers,
    ]));
    return {
        subdivisionPotential,
        frontageDepthScore,
        densityPotential,
        developerROI,
        parcelMergeOpportunity,
        rezoningUpside,
        projectability,
        developmentScenario,
        developmentSignals,
    };
}
var calculateSubdivisionPotential_2 = require("./calculateSubdivisionPotential");
Object.defineProperty(exports, "calculateSubdivisionPotential", { enumerable: true, get: function () { return calculateSubdivisionPotential_2.calculateSubdivisionPotential; } });
var calculateFrontageDepthScore_2 = require("./calculateFrontageDepthScore");
Object.defineProperty(exports, "calculateFrontageDepthScore", { enumerable: true, get: function () { return calculateFrontageDepthScore_2.calculateFrontageDepthScore; } });
var calculateDensityPotential_2 = require("./calculateDensityPotential");
Object.defineProperty(exports, "calculateDensityPotential", { enumerable: true, get: function () { return calculateDensityPotential_2.calculateDensityPotential; } });
var calculateDeveloperROI_2 = require("./calculateDeveloperROI");
Object.defineProperty(exports, "calculateDeveloperROI", { enumerable: true, get: function () { return calculateDeveloperROI_2.calculateDeveloperROI; } });
var detectParcelMergeOpportunity_2 = require("./detectParcelMergeOpportunity");
Object.defineProperty(exports, "detectParcelMergeOpportunity", { enumerable: true, get: function () { return detectParcelMergeOpportunity_2.detectParcelMergeOpportunity; } });
var simulateRezoningUpside_2 = require("./simulateRezoningUpside");
Object.defineProperty(exports, "simulateRezoningUpside", { enumerable: true, get: function () { return simulateRezoningUpside_2.simulateRezoningUpside; } });
var calculateProjectability_2 = require("./calculateProjectability");
Object.defineProperty(exports, "calculateProjectability", { enumerable: true, get: function () { return calculateProjectability_2.calculateProjectability; } });
var buildDevelopmentScenario_2 = require("./buildDevelopmentScenario");
Object.defineProperty(exports, "buildDevelopmentScenario", { enumerable: true, get: function () { return buildDevelopmentScenario_2.buildDevelopmentScenario; } });
