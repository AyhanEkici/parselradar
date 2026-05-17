import { apiPath, fileExists, finalizeSection, makeCheck, VerificationSection } from './platformVerification';

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

export function verifyModels(): VerificationSection {
  const checks = [];

  for (const modelFile of MODEL_FILES) {
    const modelPath = apiPath('models', modelFile);
    checks.push(
      makeCheck(
        CATEGORY,
        `Model ${modelFile}`,
        fileExists(modelPath) ? 'PASS' : 'FAIL',
        fileExists(modelPath) ? 'Required model file is present.' : 'Required model file is missing.',
      ),
    );
  }

  for (const serviceParts of SERVICE_FILES) {
    const servicePath = apiPath(...serviceParts);
    const name = serviceParts[serviceParts.length - 1];
    checks.push(
      makeCheck(
        CATEGORY,
        `Service ${name}`,
        fileExists(servicePath) ? 'PASS' : 'FAIL',
        fileExists(servicePath) ? 'Required service file is present.' : 'Required service file is missing.',
      ),
    );
  }

  return finalizeSection({ category: CATEGORY, checks });
}