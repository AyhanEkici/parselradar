"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyModels = verifyModels;
const platformVerification_1 = require("./platformVerification");
const CATEGORY = 'Models';
const MODEL_FILES = [
    'User.ts',
    'PropertySubmission.ts',
    'DocumentUpload.ts',
    'ConsentRecord.ts',
    'AnalysisRun.ts',
    'Report.ts',
    'CreditLedger.ts',
    'SavedAnalysis.ts',
    'Watchlist.ts',
    'Portfolio.ts',
    'PortfolioItem.ts',
    'Workspace.ts',
    'WorkspaceActivity.ts',
    'WorkspacePortfolio.ts',
    'WorkspaceWatchlist.ts',
    'Organization.ts',
    'OrganizationMember.ts',
    'NotificationEvent.ts',
    'NotificationDelivery.ts',
    'NotificationPreference.ts',
    'NotificationDigest.ts',
    'ConnectorCredentialProfile.ts',
    'ConnectorActivationRecord.ts',
    'ConnectorTestRun.ts',
    'ConnectorSourceApproval.ts',
];
const SERVICE_FILES = [
    ['services', 'notifications', 'buildNotificationInbox.ts'],
    ['services', 'notifications', 'processNotificationDelivery.ts'],
    ['services', 'portfolio', 'createPortfolioSnapshot.ts'],
    ['services', 'portfolioAnalytics', 'calculatePortfolioBenchmark.ts'],
    ['services', 'workspace', 'buildWorkspaceActivityFeed.ts'],
    ['services', 'connectorActivation', 'getConnectorActivationState.ts'],
    ['services', 'connectorActivation', 'executeConnectorTestRun.ts'],
];
function verifyModels() {
    const checks = [];
    for (const modelFile of MODEL_FILES) {
        const modelPath = (0, platformVerification_1.apiPath)('models', modelFile);
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `Model ${modelFile}`, (0, platformVerification_1.fileExists)(modelPath) ? 'PASS' : 'FAIL', (0, platformVerification_1.fileExists)(modelPath) ? 'Required model file is present.' : 'Required model file is missing.'));
    }
    for (const serviceParts of SERVICE_FILES) {
        const servicePath = (0, platformVerification_1.apiPath)(...serviceParts);
        const name = serviceParts[serviceParts.length - 1];
        checks.push((0, platformVerification_1.makeCheck)(CATEGORY, `Service ${name}`, (0, platformVerification_1.fileExists)(servicePath) ? 'PASS' : 'FAIL', (0, platformVerification_1.fileExists)(servicePath) ? 'Required service file is present.' : 'Required service file is missing.'));
    }
    return (0, platformVerification_1.finalizeSection)({ category: CATEGORY, checks });
}
