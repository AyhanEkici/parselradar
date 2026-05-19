import { ConnectorKeyV26 } from '../connectors/connectorCapabilityMatrix';

export type ConnectorTermsRecord = {
  connectorKey: ConnectorKeyV26;
  termsVersion: string;
  accepted: boolean;
  acceptedAt: string | null;
};

function env(name: string) {
  return String(process.env[name] || '').trim();
}

function accepted(connectorKey: ConnectorKeyV26) {
  return env(`CONNECTOR_${connectorKey.toUpperCase()}_TERMS_ACCEPTED`).toLowerCase() === 'true';
}

export function connectorTermsRegistry(nowIso = new Date().toISOString()): ConnectorTermsRecord[] {
  const keys: ConnectorKeyV26[] = [
    'tkgm_parcel_metadata',
    'municipality_planning_metadata',
    'public_zoning_references',
    'infrastructure_references',
    'demographic_references',
    'regional_development_references',
  ];

  return keys.map((connectorKey) => ({
    connectorKey,
    termsVersion: env(`CONNECTOR_${connectorKey.toUpperCase()}_TERMS_VERSION`) || 'unversioned',
    accepted: accepted(connectorKey),
    acceptedAt: env(`CONNECTOR_${connectorKey.toUpperCase()}_TERMS_ACCEPTED_AT`) || (accepted(connectorKey) ? nowIso : null),
  }));
}
