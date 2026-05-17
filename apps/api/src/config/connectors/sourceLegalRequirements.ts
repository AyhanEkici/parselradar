export const SOURCE_LEGAL_REQUIREMENTS: Record<string, { required: boolean; description: string }> = {
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

export function isLegalRequirementApproved(requirementKey: string) {
  return process.env[`LEGAL_APPROVED_${requirementKey.toUpperCase()}`] === 'true';
}
