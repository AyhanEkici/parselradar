type Presence = 'PRESENT' | 'MISSING';

type EnvCheck = {
  key: string;
  status: Presence;
};

const REQUIRED_LAUNCH_KEYS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLIENT_URL',
  'API_URL',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_FROM',
  'SMTP_SECURE',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
] as const;

function hasValue(key: string): boolean {
  return String(process.env[key] || '').trim().length > 0;
}

function checkKeys(keys: readonly string[]): EnvCheck[] {
  return keys.map((key) => ({ key, status: hasValue(key) ? 'PRESENT' : 'MISSING' }));
}

function printCheck(row: EnvCheck): void {
  console.log(`${row.key} ${row.status}`);
}

function printManualGates(): void {
  console.log('DNS_SPF_STATUS MANUAL_REQUIRED');
  console.log('DNS_DKIM_STATUS MANUAL_REQUIRED');
  console.log('DNS_DMARC_STATUS MANUAL_REQUIRED');
  console.log('SECRET_ROTATION_STATUS MANUAL_REQUIRED');
}

function main(): void {
  const checks = checkKeys(REQUIRED_LAUNCH_KEYS);
  checks.forEach(printCheck);
  printManualGates();

  const missing = checks.filter((row) => row.status === 'MISSING');
  if (missing.length > 0) {
    process.exitCode = 1;
  }
}

main();
