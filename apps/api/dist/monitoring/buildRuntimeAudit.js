"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRuntimeAudit = buildRuntimeAudit;
const runtimeSecretsValidator_1 = require("../security/runtimeSecretsValidator");
const apiExposureAudit_1 = require("../security/apiExposureAudit");
const deploymentGuard_1 = require("../security/deploymentGuard");
function buildRuntimeAudit() {
    const secrets = (0, runtimeSecretsValidator_1.runtimeSecretsValidator)();
    const exposure = (0, apiExposureAudit_1.apiExposureAudit)();
    const guard = (0, deploymentGuard_1.deploymentGuard)();
    return {
        runtimeSecrets: secrets,
        securityAuditSummary: exposure.securityAuditSummary,
        deploymentGuard: guard.deploymentGuard,
    };
}
