import { ConnectorExecutionContract, ConnectorSampleValidationResult, ConnectorState, ConnectorTestOutcome } from '../connectorContracts';
import { isLegalRequirementApproved } from '../../config/connectors/sourceLegalRequirements';
import { syncTucbsLayerCatalog } from './tucbsLayerCatalog';

export const tucbsConnectorExecution: ConnectorExecutionContract = {
  key: 'tucbs_ogc',
  requiredEnv: ['CONNECTOR_TUCBS_WMS_ENDPOINT'],
  legalRequirement: 'tucbs_public_layers_terms',

  status(): ConnectorState {
    const wms = String(process.env.CONNECTOR_TUCBS_WMS_ENDPOINT || '').trim();
    if (!wms) return 'NOT_CONFIGURED';
    if (!isLegalRequirementApproved('tucbs_public_layers_terms')) return 'LEGAL_REVIEW_REQUIRED';
    return 'READY_FOR_TEST';
  },

  async test(): Promise<ConnectorTestOutcome> {
    const checkedAt = new Date().toISOString();
    const state = this.status();

    if (state !== 'READY_FOR_TEST') {
      return {
        state,
        message: `TUCBS connector is ${state}`,
        checkedAt,
      };
    }

    const result = await syncTucbsLayerCatalog();
    const wmsState = result.diagnostics.services.find((item) => item.service === 'WMS');

    if (!wmsState || !wmsState.available || wmsState.parseState !== 'PARSED') {
      return {
        state: 'TEST_FAILED',
        message: wmsState?.error || 'WMS capabilities unavailable or parse failed',
        checkedAt,
      };
    }

    return {
      state: 'TEST_PASSED',
      message: `TUCBS OGC capabilities parsed successfully (${result.layers.length} layers detected).`,
      checkedAt,
      samplePayloadSchema: {
        mode: 'READ_ONLY_GEO_LAYERS',
        services: ['WMS', 'WMTS', 'WFS'],
        ownershipData: false,
      },
    };
  },

  validateSample(sample: unknown): ConnectorSampleValidationResult {
    if (!sample || typeof sample !== 'object') {
      return { valid: false, errors: ['Sample must be an object'] };
    }

    const payload = sample as Record<string, unknown>;
    const errors: string[] = [];
    if (!Array.isArray(payload.services)) {
      errors.push('services must be an array');
    }
    if (payload.mode !== 'READ_ONLY_GEO_LAYERS') {
      errors.push('mode must be READ_ONLY_GEO_LAYERS');
    }

    return { valid: errors.length === 0, errors };
  },

  normalizeSample(sample: unknown): Record<string, unknown> {
    const payload = (sample || {}) as Record<string, unknown>;
    return {
      connectorKey: 'tucbs_ogc',
      mode: 'READ_ONLY_GEO_LAYERS',
      services: Array.isArray(payload.services) ? payload.services : ['WMS', 'WMTS', 'WFS'],
      ownershipData: false,
      readOnly: true,
    };
  },
};
