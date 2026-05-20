export type RoleHydrationResult = {
  valid: boolean;
  normalizedRole: 'ADMIN' | 'USER' | 'UNKNOWN';
  reason: string;
};

export function roleHydrationVerifier(role: unknown): RoleHydrationResult {
  const normalized = String(role || '').toUpperCase();
  if (normalized === 'ADMIN') {
    return { valid: true, normalizedRole: 'ADMIN', reason: 'admin_role' };
  }
  if (normalized === 'USER') {
    return { valid: true, normalizedRole: 'USER', reason: 'user_role' };
  }
  return { valid: false, normalizedRole: 'UNKNOWN', reason: 'unknown_role' };
}
