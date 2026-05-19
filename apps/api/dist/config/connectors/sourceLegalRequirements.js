"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOURCE_LEGAL_REQUIREMENTS = void 0;
exports.isLegalRequirementApproved = isLegalRequirementApproved;
exports.SOURCE_LEGAL_REQUIREMENTS = {
    tkgm_license: {
        required: true,
        description: 'TKGM data usage and licensing approval must be documented.',
    },
    municipality_terms: {
        required: true,
        description: 'Municipality open data terms must be accepted and recorded.',
    },
    listing_feed_terms: {
        required: true,
        description: 'Listing provider redistribution and caching terms must be approved.',
    },
    infrastructure_feed_terms: {
        required: true,
        description: 'Infrastructure data source legal terms must be approved.',
    },
    demographic_feed_terms: {
        required: true,
        description: 'Demographic data provider legal terms must be approved.',
    },
    map_provider_terms: {
        required: true,
        description: 'Map/geocoding provider terms and attribution requirements must be approved.',
    },
    email_provider_terms: {
        required: true,
        description: 'Email provider compliance terms (anti-spam, sender identity) must be approved.',
    },
};
function isLegalRequirementApproved(requirementKey) {
    return process.env[`LEGAL_APPROVED_${requirementKey.toUpperCase()}`] === 'true';
}
