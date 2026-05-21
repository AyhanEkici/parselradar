import { ConnectorKey } from '../../connectors/connectorContracts';

export const CONNECTOR_ENDPOINT_REQUIREMENTS: Record<ConnectorKey, string | null> = {
  tucbs_ogc: 'CONNECTOR_TUCBS_WMS_ENDPOINT',
  tkgm_parcel: 'CONNECTOR_TKGM_ENDPOINT',
  municipality_zoning: 'CONNECTOR_MUNICIPALITY_ENDPOINT',
  listing_feed: 'CONNECTOR_LISTING_ENDPOINT',
  infrastructure_feed: 'CONNECTOR_INFRA_ENDPOINT',
  demographic_feed: 'CONNECTOR_DEMOGRAPHIC_ENDPOINT',
  map_geocoding: 'CONNECTOR_MAPS_ENDPOINT',
  email_provider: 'NOTIFY_SMTP_HOST',
};
