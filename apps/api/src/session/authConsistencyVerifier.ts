import { roleHydrationVerifier } from './roleHydrationVerifier';

export type AuthConsistencyInput = {
  tokenUserId?: string;
  dbUserId?: string;
  dbRole?: string;
};

export type AuthConsistencyResult = {
  consistent: boolean;
  reason: string;
};

export function authConsistencyVerifier(input: AuthConsistencyInput): AuthConsistencyResult {
  if (!input.tokenUserId || !input.dbUserId) {
    return { consistent: false, reason: 'missing_identity' };
  }
  if (String(input.tokenUserId) !== String(input.dbUserId)) {
    return { consistent: false, reason: 'token_db_mismatch' };
  }

  const roleCheck = roleHydrationVerifier(input.dbRole);
  if (!roleCheck.valid) {
    return { consistent: false, reason: 'invalid_role_hydration' };
  }

  return { consistent: true, reason: 'auth_consistent' };
}
