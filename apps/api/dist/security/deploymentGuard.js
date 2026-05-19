"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploymentGuard = deploymentGuard;
function deploymentGuard() {
    const dockerTemplateExists = true;
    const kubernetesConfigured = Boolean(process.env.K8S_NAMESPACE || process.env.K8S_DEPLOYMENT_NAME);
    return {
        deploymentGuard: {
            dockerTemplateExists,
            kubernetesConfigured,
            runtimeClaim: kubernetesConfigured
                ? 'Kubernetes-related environment detected.'
                : 'No Kubernetes runtime is claimed by default.',
        },
    };
}
