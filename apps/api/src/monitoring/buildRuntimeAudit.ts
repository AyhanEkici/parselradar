import { runtimeSecretsValidator } from '../security/runtimeSecretsValidator';
import { apiExposureAudit } from '../security/apiExposureAudit';
import { deploymentGuard } from '../security/deploymentGuard';

export function buildRuntimeAudit() {
  const secrets = runtimeSecretsValidator();
  const exposure = apiExposureAudit();
  const guard = deploymentGuard();

  return {
    runtimeSecrets: secrets,
    securityAuditSummary: exposure.securityAuditSummary,
    deploymentGuard: guard.deploymentGuard,
  };
}
