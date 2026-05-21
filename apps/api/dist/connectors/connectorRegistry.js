"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONNECTOR_REGISTRY = void 0;
exports.findConnectorByKey = findConnectorByKey;
exports.CONNECTOR_REGISTRY = [
    {
        key: 'tucbs_ogc',
        name: 'TUCBS Public Geo-Layer Connector',
        description: 'Read-only OGC layer provider for public geo layers (WMS/WMTS/WFS capabilities).',
        category: 'geo_layers',
        credentialEnvKeys: [],
        endpointEnvKey: 'CONNECTOR_TUCBS_WMS_ENDPOINT',
        legalRequirementKey: 'tucbs_public_layers_terms',
        activeEnvKey: 'CONNECTOR_TUCBS_ACTIVE',
    },
    {
        key: 'tkgm_parcel',
        name: 'TKGM Parcel Connector',
        description: 'Parcel cadastre integration for title/parcel lookups.',
        category: 'cadastre',
        credentialEnvKeys: ['CONNECTOR_TKGM_API_KEY'],
        endpointEnvKey: 'CONNECTOR_TKGM_ENDPOINT',
        legalRequirementKey: 'tkgm_license',
        activeEnvKey: 'CONNECTOR_TKGM_ACTIVE',
    },
    {
        key: 'municipality_zoning',
        name: 'Municipality Zoning Connector',
        description: 'Municipality-level zoning and planning data.',
        category: 'zoning',
        credentialEnvKeys: ['CONNECTOR_MUNICIPALITY_TOKEN'],
        endpointEnvKey: 'CONNECTOR_MUNICIPALITY_ENDPOINT',
        legalRequirementKey: 'municipality_terms',
        activeEnvKey: 'CONNECTOR_MUNICIPALITY_ACTIVE',
    },
    {
        key: 'listing_feed',
        name: 'Listing Feed Connector',
        description: 'External listing feed ingestion connector.',
        category: 'market',
        credentialEnvKeys: ['CONNECTOR_LISTING_API_KEY'],
        endpointEnvKey: 'CONNECTOR_LISTING_ENDPOINT',
        legalRequirementKey: 'listing_feed_terms',
        activeEnvKey: 'CONNECTOR_LISTING_ACTIVE',
    },
    {
        key: 'infrastructure_feed',
        name: 'Infrastructure Feed Connector',
        description: 'Infrastructure datasets for transport/utilities proximity.',
        category: 'infrastructure',
        credentialEnvKeys: ['CONNECTOR_INFRA_API_KEY'],
        endpointEnvKey: 'CONNECTOR_INFRA_ENDPOINT',
        legalRequirementKey: 'infrastructure_feed_terms',
        activeEnvKey: 'CONNECTOR_INFRA_ACTIVE',
    },
    {
        key: 'demographic_feed',
        name: 'Demographic Feed Connector',
        description: 'Demographic and neighborhood profile feed connector.',
        category: 'demographic',
        credentialEnvKeys: ['CONNECTOR_DEMOGRAPHIC_API_KEY'],
        endpointEnvKey: 'CONNECTOR_DEMOGRAPHIC_ENDPOINT',
        legalRequirementKey: 'demographic_feed_terms',
        activeEnvKey: 'CONNECTOR_DEMOGRAPHIC_ACTIVE',
    },
    {
        key: 'map_geocoding',
        name: 'Map/Geocoding Connector',
        description: 'Geocoding and mapping provider integration.',
        category: 'mapping',
        credentialEnvKeys: ['CONNECTOR_MAPS_API_KEY'],
        endpointEnvKey: 'CONNECTOR_MAPS_ENDPOINT',
        legalRequirementKey: 'map_provider_terms',
        activeEnvKey: 'CONNECTOR_MAPS_ACTIVE',
    },
    {
        key: 'email_provider',
        name: 'Email Provider Connector',
        description: 'Email transport provider for notification delivery.',
        category: 'communications',
        credentialEnvKeys: ['NOTIFY_SMTP_HOST', 'NOTIFY_SMTP_USER', 'NOTIFY_SMTP_PASS', 'NOTIFY_EMAIL_FROM'],
        endpointEnvKey: 'NOTIFY_SMTP_HOST',
        legalRequirementKey: 'email_provider_terms',
        activeEnvKey: 'CONNECTOR_EMAIL_ACTIVE',
    },
];
function findConnectorByKey(connectorKey) {
    return exports.CONNECTOR_REGISTRY.find((connector) => connector.key === connectorKey);
}
