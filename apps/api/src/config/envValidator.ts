type EnvValidationResult = {
  checkedAt: string;
  valid: boolean;
  missingRequired: string[];
  missingRecommended: string[];
  warnings: string[];
};

const REQUIRED_KEYS = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
const RECOMMENDED_KEYS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'REDIS_URL',
];

function hasValue(key: string) {
  return String(process.env[key] || '').trim().length > 0;
}

export function validateRuntimeEnv(): EnvValidationResult {
  const missingRequired = REQUIRED_KEYS.filter((key) => !hasValue(key));
  const missingRecommended = RECOMMENDED_KEYS.filter((key) => !hasValue(key));
  const warnings: string[] = [];

  if (missingRecommended.length > 0) {
    warnings.push(`Recommended env vars missing: ${missingRecommended.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production' && !hasValue('STRIPE_SECRET_KEY')) {
    warnings.push('Production stripe payments are disabled because STRIPE_SECRET_KEY is missing.');
  }

  if (process.env.NODE_ENV === 'production' && !hasValue('SMTP_HOST')) {
    warnings.push('Production password reset email is degraded because SMTP_HOST is missing.');
  }

  return {
    checkedAt: new Date().toISOString(),
    valid: missingRequired.length === 0,
    missingRequired,
    missingRecommended,
    warnings,
  };
}
