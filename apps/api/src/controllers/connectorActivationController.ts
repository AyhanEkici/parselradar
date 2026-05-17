import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CONNECTOR_REGISTRY, findConnectorByKey } from '../connectors/connectorRegistry';
import { buildConnectorReadiness } from '../services/connectorActivation/buildConnectorReadiness';
import { buildLegalSourceRegistry } from '../services/connectorActivation/buildLegalSourceRegistry';
import { validateConnectorCredentials } from '../services/connectorActivation/validateConnectorCredentials';
import { runConnectorHealthCheck } from '../services/connectorActivation/runConnectorHealthCheck';
import { buildConnectorActivationPlan } from '../services/connectorActivation/buildConnectorActivationPlan';
import { buildConnectorAuditTrail } from '../services/connectorActivation/buildConnectorAuditTrail';
import { connectorStatus } from '../connectors/connectorStatus';
import { SOURCE_LEGAL_REQUIREMENTS } from '../config/connectors/sourceLegalRequirements';

export const getAdminConnectors = async (_req: AuthRequest, res: Response) => {
  const readiness = buildConnectorReadiness();
  const legalRegistry = buildLegalSourceRegistry();

  return res.json({
    generatedAt: new Date().toISOString(),
    connectors: readiness.connectors,
    summary: readiness.summary,
    legalRegistry,
  });
};

export const getAdminConnectorByKey = async (req: AuthRequest, res: Response) => {
  const connector = findConnectorByKey(req.params.connectorKey);
  if (!connector) return res.status(404).json({ error: 'Connector not found' });

  const status = connectorStatus(connector);
  const credentials = validateConnectorCredentials(connector);
  const activationPlan = buildConnectorActivationPlan(connector);

  return res.json({
    connector: {
      ...connector,
      legalRequirement: SOURCE_LEGAL_REQUIREMENTS[connector.legalRequirementKey],
    },
    status,
    credentials,
    activationPlan,
  });
};

export const postAdminConnectorTest = async (req: AuthRequest, res: Response) => {
  const connector = findConnectorByKey(req.params.connectorKey);
  if (!connector) return res.status(404).json({ error: 'Connector not found' });

  const healthCheck = await runConnectorHealthCheck(connector);
  return res.json(healthCheck);
};

export const getAdminConnectorActivationPlan = async (req: AuthRequest, res: Response) => {
  const connector = findConnectorByKey(req.params.connectorKey);
  if (!connector) return res.status(404).json({ error: 'Connector not found' });

  const plan = buildConnectorActivationPlan(connector);
  return res.json(plan);
};

export const getAdminConnectorAuditTrail = async (_req: AuthRequest, res: Response) => {
  const audits = await buildConnectorAuditTrail();

  return res.json({
    connectorsTracked: CONNECTOR_REGISTRY.map((c) => c.key),
    ...audits,
  });
};
