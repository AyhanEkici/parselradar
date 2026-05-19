"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectStrategicLocation = exports.calculateRegionalDemand = exports.calculateGrowthPotential = exports.calculateUtilityCoverage = exports.calculateRoadAccessScore = exports.calculateInfrastructureScore = void 0;
exports.buildGeoIntelligence = buildGeoIntelligence;
const calculateInfrastructureScore_1 = require("./calculateInfrastructureScore");
const calculateRoadAccessScore_1 = require("./calculateRoadAccessScore");
const calculateUtilityCoverage_1 = require("./calculateUtilityCoverage");
const calculateGrowthPotential_1 = require("./calculateGrowthPotential");
const calculateRegionalDemand_1 = require("./calculateRegionalDemand");
const detectStrategicLocation_1 = require("./detectStrategicLocation");
function buildGeoIntelligence(input) {
    const infrastructure = (0, calculateInfrastructureScore_1.calculateInfrastructureScore)({
        roadAccess: input.roadAccess,
        electricity: input.electricity,
        water: input.water,
        areaM2: input.areaM2,
    });
    const road = (0, calculateRoadAccessScore_1.calculateRoadAccessScore)(input.roadAccess);
    const utilities = (0, calculateUtilityCoverage_1.calculateUtilityCoverage)({
        electricity: input.electricity,
        water: input.water,
    });
    const growth = (0, calculateGrowthPotential_1.calculateGrowthPotential)(input.city, input.district);
    const demand = (0, calculateRegionalDemand_1.calculateRegionalDemand)(input.city, input.district, input.zoningStatus);
    const strategic = (0, detectStrategicLocation_1.detectStrategicLocation)({
        city: input.city,
        district: input.district,
        areaM2: input.areaM2,
        zoningStatus: input.zoningStatus,
    });
    const summary = `Infrastructure readiness: ${infrastructure}. ` +
        `Road access: ${road}. ` +
        `Utility coverage: ${utilities.totalScore}%. ` +
        `Growth phase: ${growth.developmentPhase} with ${growth.growthIndicators}% indicators. ` +
        `Regional demand: ${demand.demandLevel}. ` +
        (strategic.length > 0 ? `Strategic signals: ${strategic.join(', ')}.` : 'No strategic signals detected.');
    return {
        infrastructureScore: infrastructure,
        roadAccessScore: road,
        utilityCoverage: utilities,
        growthPotential: growth,
        regionalDemand: demand,
        strategicLocationSignals: strategic,
        geoSummary: summary,
    };
}
var calculateInfrastructureScore_2 = require("./calculateInfrastructureScore");
Object.defineProperty(exports, "calculateInfrastructureScore", { enumerable: true, get: function () { return calculateInfrastructureScore_2.calculateInfrastructureScore; } });
var calculateRoadAccessScore_2 = require("./calculateRoadAccessScore");
Object.defineProperty(exports, "calculateRoadAccessScore", { enumerable: true, get: function () { return calculateRoadAccessScore_2.calculateRoadAccessScore; } });
var calculateUtilityCoverage_2 = require("./calculateUtilityCoverage");
Object.defineProperty(exports, "calculateUtilityCoverage", { enumerable: true, get: function () { return calculateUtilityCoverage_2.calculateUtilityCoverage; } });
var calculateGrowthPotential_2 = require("./calculateGrowthPotential");
Object.defineProperty(exports, "calculateGrowthPotential", { enumerable: true, get: function () { return calculateGrowthPotential_2.calculateGrowthPotential; } });
var calculateRegionalDemand_2 = require("./calculateRegionalDemand");
Object.defineProperty(exports, "calculateRegionalDemand", { enumerable: true, get: function () { return calculateRegionalDemand_2.calculateRegionalDemand; } });
var detectStrategicLocation_2 = require("./detectStrategicLocation");
Object.defineProperty(exports, "detectStrategicLocation", { enumerable: true, get: function () { return detectStrategicLocation_2.detectStrategicLocation; } });
