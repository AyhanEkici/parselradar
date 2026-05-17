import { findConnectorExecution } from '../../connectors/connectorExecutionRegistry';

/**
 * Validates a sample payload against the connector's expected schema.
 * Used after a test run to confirm the shape of sample data.
 * Does not perform any live calls.
 */
export function validateConnectorSamplePayload(params: {
  connectorKey: string;
  sample: unknown;
}) {
  const { connectorKey, sample } = params;

  const execution = findConnectorExecution(connectorKey);
  if (!execution) {
    return { valid: false, errors: [`Connector not found: ${connectorKey}`] };
  }

  return execution.validateSample(sample);
}
