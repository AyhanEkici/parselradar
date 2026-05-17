export type DeploymentState = 'NOT_CONFIGURED' | 'TEMPLATE_ONLY' | 'READY';

export function resolveDeploymentProfile() {
  const hasRuntimeCore = Boolean(process.env.MONGODB_URI && process.env.JWT_SECRET && process.env.CLIENT_URL);
  const hasContainerFlags = Boolean(process.env.DEPLOYMENT_PROFILE || process.env.DEPLOYMENT_STATE);

  const deploymentStatus: DeploymentState = hasRuntimeCore
    ? hasContainerFlags
      ? 'READY'
      : 'TEMPLATE_ONLY'
    : 'NOT_CONFIGURED';

  return {
    deploymentStatus,
    deploymentProfile: process.env.DEPLOYMENT_PROFILE || 'template',
    deploymentStateDeclared: process.env.DEPLOYMENT_STATE || 'TEMPLATE_ONLY',
    cloudRuntimeClaim: 'No active Kubernetes or cloud deployment is inferred from templates alone.',
  };
}
