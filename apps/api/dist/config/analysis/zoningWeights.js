"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LAND_USE_DESIRABILITY_WEIGHTS = exports.DEFAULT_ZONING_PROFILE = exports.ZONING_WEIGHTS = void 0;
exports.ZONING_WEIGHTS = {
    konut: { zoningPotentialScore: 85, desirabilityScore: 82 },
    residential: { zoningPotentialScore: 85, desirabilityScore: 82 },
    ticari: { zoningPotentialScore: 90, desirabilityScore: 88 },
    commercial: { zoningPotentialScore: 90, desirabilityScore: 88 },
    mixed: { zoningPotentialScore: 88, desirabilityScore: 86 },
    karma: { zoningPotentialScore: 88, desirabilityScore: 86 },
    sanayi: { zoningPotentialScore: 72, desirabilityScore: 68 },
    industrial: { zoningPotentialScore: 72, desirabilityScore: 68 },
    tarla: { zoningPotentialScore: 35, desirabilityScore: 30 },
    tarim: { zoningPotentialScore: 35, desirabilityScore: 30 },
    agricultural: { zoningPotentialScore: 35, desirabilityScore: 30 },
    sit: { zoningPotentialScore: 25, desirabilityScore: 22 },
    protected: { zoningPotentialScore: 25, desirabilityScore: 22 },
    park: { zoningPotentialScore: 25, desirabilityScore: 22 },
};
exports.DEFAULT_ZONING_PROFILE = {
    zoningPotentialScore: 45,
    desirabilityScore: 50,
};
exports.LAND_USE_DESIRABILITY_WEIGHTS = {
    zoningDesirability: 0.5,
    infrastructureSupport: 0.3,
    parcelSizeFit: 0.2,
};
