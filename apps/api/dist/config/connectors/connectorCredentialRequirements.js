"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONNECTOR_CREDENTIAL_REQUIREMENTS = void 0;
exports.CONNECTOR_CREDENTIAL_REQUIREMENTS = {
    tkgm_parcel: ['CONNECTOR_TKGM_API_KEY'],
    municipality_zoning: ['CONNECTOR_MUNICIPALITY_TOKEN'],
    listing_feed: ['CONNECTOR_LISTING_API_KEY'],
    infrastructure_feed: ['CONNECTOR_INFRA_API_KEY'],
    demographic_feed: ['CONNECTOR_DEMOGRAPHIC_API_KEY'],
    map_geocoding: ['CONNECTOR_MAPS_API_KEY'],
    email_provider: ['NOTIFY_SMTP_HOST', 'NOTIFY_SMTP_USER', 'NOTIFY_SMTP_PASS', 'NOTIFY_EMAIL_FROM'],
};
