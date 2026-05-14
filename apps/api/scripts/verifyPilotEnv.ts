import dotenv from 'dotenv';
import { URL } from 'url';
dotenv.config({ path: '../../.env' });

const requiredVars = [
  'NODE_ENV', 'PORT', 'CLIENT_URL', 'API_URL', 'MONGODB_URI', 'JWT_SECRET',
  'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_5_CREDITS', 'STRIPE_PRICE_10_CREDITS', 'STRIPE_PRICE_25_CREDITS', 'STRIPE_PRICE_50_CREDITS',
  'ADMIN_EMAIL', 'ADMIN_PASSWORD'
];
const optionalVars = ['PILOT_REQUIRE_ATLAS'];
const results: { [k: string]: string } = {};
const missing: string[] = [];

function redact(val: string, type: string) {
  if (!val) return '';
  if (type === 'sk') return 'sk_test_****' + val.slice(-4);
  if (type === 'wh') return 'whsec_****' + val.slice(-4);
  if (type === 'price') return 'price_****' + val.slice(-4);
  if (type === 'mongo') return 'mongodb://****redacted';
  return val.length > 8 ? val.slice(0, 2) + '****' + val.slice(-2) : '****';
}

function isPlaceholder(val: string) {
  if (!val) return true;
  const lower = val.toLowerCase();
  return (
    val === '' ||
    lower.includes('change_me') ||
    lower.startsWith('your_') ||
    lower.endsWith('xxx') ||
    lower === 'changeme' ||
    lower === 'test' ||
    lower === 'placeholder'
  );
}

let allPass = true;
for (const v of requiredVars) {
  const val = process.env[v] || '';
  let pass = true;
  let reason = '';
  if (isPlaceholder(val)) {
    pass = false;
    reason = 'MISSING_OR_PLACEHOLDER';
  }
  if (v.startsWith('STRIPE_SECRET_KEY')) {
    if (!val.startsWith('sk_test_')) { pass = false; reason = 'MUST_START_WITH_sk_test_'; }
    results[v] = pass ? redact(val, 'sk') : reason;
  } else if (v.startsWith('STRIPE_WEBHOOK_SECRET')) {
    if (!val.startsWith('whsec_')) { pass = false; reason = 'MUST_START_WITH_whsec_'; }
    results[v] = pass ? redact(val, 'wh') : reason;
  } else if (v.startsWith('STRIPE_PRICE_')) {
    if (!val.startsWith('price_')) { pass = false; reason = 'MUST_START_WITH_price_'; }
    results[v] = pass ? redact(val, 'price') : reason;
  } else if (v === 'MONGODB_URI') {
    if (process.env.PILOT_REQUIRE_ATLAS === 'true' && val.includes('localhost')) { pass = false; reason = 'MUST_USE_ATLAS'; }
    results[v] = pass ? redact(val, 'mongo') : reason;
  } else if (v === 'JWT_SECRET') {
    if (val.length < 32) { pass = false; reason = 'TOO_SHORT'; }
    results[v] = pass ? '****' : reason;
  } else if (v === 'CLIENT_URL' || v === 'API_URL') {
    try { new URL(val); } catch { pass = false; reason = 'INVALID_URL'; }
    results[v] = pass ? val : reason;
  } else {
    results[v] = pass ? '****' : reason;
  }
  if (!pass) { allPass = false; missing.push(v); }
}

for (const v of optionalVars) {
  if (process.env[v]) results[v] = process.env[v]!;
}

for (const v of requiredVars) {
  console.log(`${v}: ${results[v]}`);
}
if (!allPass) {
  console.log('PILOT_ENV_CONFIG_REQUIRED');
  console.log('MISSING_OR_INVALID:', missing);
  process.exit(1);
} else {
  console.log('PASS');
  process.exit(0);
}
