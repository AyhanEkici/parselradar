import { apiPath, fileExists, readText } from './platformVerification';
import type { RbacCheck } from './verifyAdminAccess';

const CONTROLLERS = [
  apiPath('controllers', 'propertyController.ts'),
  apiPath('controllers', 'analysisController.ts'),
  apiPath('controllers', 'reportController.ts'),
  apiPath('controllers', 'documentController.ts'),
  apiPath('controllers', 'portfolioController.ts'),
  apiPath('controllers', 'investorController.ts'),
  apiPath('controllers', 'notificationController.ts'),
  apiPath('controllers', 'workspaceController.ts'),
  apiPath('controllers', 'exportController.ts'),
];

export function verifyUserIsolation(): RbacCheck[] {
  const checks: RbacCheck[] = [];

  for (const file of CONTROLLERS) {
    const exists = fileExists(file);
    checks.push({
      id: `controller_exists_${file.split(/[\\/]/).pop()}`,
      status: exists ? 'PASS' : 'FAIL',
      message: exists ? `${file} exists` : `${file} missing`,
    });
    if (!exists) continue;

    const content = readText(file);
    const hasScopeHelper = /scopeFilters|OwnerScope|buildOwnerScopedFilter/.test(content);
    const hasMembershipGuard = /requireMembership|canPerformWorkspaceAction/.test(content);
    const hasOwnerGuard =
      /assertOwnerOrAdmin|findOne\(\{[^}]*userId|find\(\{[^}]*userId/.test(content) || hasScopeHelper || hasMembershipGuard;

    checks.push({
      id: `scope_helper_${file.split(/[\\/]/).pop()}`,
      status: hasScopeHelper || hasMembershipGuard ? 'PASS' : 'FAIL',
      message: hasScopeHelper
        ? 'Owner scope helper usage detected'
        : hasMembershipGuard
          ? 'Membership-based scope guard usage detected'
          : 'Owner scope helper usage missing',
    });

    checks.push({
      id: `owner_guard_${file.split(/[\\/]/).pop()}`,
      status: hasOwnerGuard ? 'PASS' : 'FAIL',
      message: hasOwnerGuard
        ? 'Owner guard patterns detected'
        : 'Owner guard patterns missing',
    });
  }

  return checks;
}
