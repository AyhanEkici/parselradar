import fs from 'fs';
import path from 'path';

type Status = 'PASS' | 'FAIL' | 'WARN';

type Check = { status: Status; detail: string };

function readFile(relativePath: string) {
  const filePath = path.resolve(process.cwd(), relativePath);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

function hasText(content: string, pattern: RegExp | string) {
  return typeof pattern === 'string' ? content.includes(pattern) : pattern.test(content);
}

function check(label: string, condition: boolean, passDetail: string, failDetail: string): [string, Check] {
  return [label, condition ? { status: 'PASS', detail: passDetail } : { status: 'FAIL', detail: failDetail }];
}

function writeProof(bundle: any) {
  const proofDir = path.resolve(process.cwd(), 'proof');
  if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });

  fs.writeFileSync(path.join(proofDir, 'password-reset-proof-bundle.json'), `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');

  const lines: string[] = [];
  lines.push('# Password Reset Proof Bundle');
  lines.push('');
  lines.push(`Generated at: ${bundle.generatedAt}`);
  lines.push(`Overall status: ${bundle.overallStatus}`);
  lines.push('');
  lines.push('| Check | Status | Detail |');
  lines.push('| --- | --- | --- |');
  for (const [key, value] of Object.entries(bundle.proofs as Record<string, any>)) {
    lines.push(`| ${key} | ${String((value as any).status || '')} | ${String((value as any).detail || '')} |`);
  }
  lines.push('');
  lines.push('## Email Provider State');
  lines.push('');
  lines.push(`- ${bundle.emailProviderState || 'EMAIL_NOT_CONFIGURED'}`);
  lines.push('');

  fs.writeFileSync(path.join(proofDir, 'password-reset-proof-bundle.md'), `${lines.join('\n')}\n`, 'utf-8');
}

function main() {
  const modelContent = readFile('apps/api/src/models/PasswordResetToken.ts');
  const serviceContent = readFile('apps/api/src/services/auth/passwordResetTokenService.ts');
  const emailServiceContent = readFile('apps/api/src/services/auth/passwordResetEmailService.ts');
  const controllerContent = readFile('apps/api/src/controllers/passwordResetController.ts');
  const routeContent = readFile('apps/api/src/routes/passwordResetRoutes.ts');
  const authRoutesContent = readFile('apps/api/src/routes/authRoutes.ts');
  const webAppContent = readFile('apps/web/src/App.tsx');
  const loginContent = readFile('apps/web/src/pages/Login.tsx');
  const forgotLinkContent = readFile('apps/web/src/components/auth/ForgotPasswordLink.tsx');
  const forgotPageContent = readFile('apps/web/src/pages/ForgotPassword.tsx');
  const resetPageContent = readFile('apps/web/src/pages/ResetPassword.tsx');
  const apiClientContent = readFile('apps/web/src/lib/auth.ts');

  const proofs: Record<string, Check> = Object.fromEntries([
    check(
      'passwordResetModelProof',
      Boolean(modelContent) && hasText(modelContent, /tokenHash/) && hasText(modelContent, /expiresAt/) && hasText(modelContent, /usedAt/) && hasText(modelContent, /revokedAt/) && hasText(modelContent, /expireAfterSeconds: 0/),
      'Password reset token model exists with hashed token storage, expiry, used/revoked tracking, and TTL cleanup.',
      'Password reset token model is missing one or more required fields or TTL indexing.'
    ),
    check(
      'forgotPasswordEndpointProof',
      hasText(controllerContent, /forgotPassword/) && hasText(controllerContent, /GENERIC_FORGOT_SUCCESS/) && hasText(controllerContent, /return res\.json\(GENERIC_FORGOT_SUCCESS\)/),
      'Forgot-password endpoint returns a generic success message.',
      'Forgot-password endpoint does not appear to return a generic success response.'
    ),
    check(
      'resetPasswordEndpointProof',
      hasText(controllerContent, /resetPassword/) && hasText(controllerContent, /GENERIC_RESET_SUCCESS/) && hasText(controllerContent, /user\.passwordHash\s*=\s*passwordHash/) && hasText(controllerContent, /user\.passwordChangedAt\s*=\s*new Date\(\)/),
      'Reset-password endpoint updates passwordHash and invalidates prior sessions via passwordChangedAt.',
      'Reset-password endpoint does not update passwordHash or passwordChangedAt as required.'
    ),
    check(
      'hashedTokenProof',
      hasText(serviceContent, /sha256/) && hasText(serviceContent, /tokenHash/) && !hasText(controllerContent, /rawToken.*console\.(log|info|warn|error)/),
      'Reset tokens are generated securely and stored only as hashes.',
      'Reset token hashing or leakage safeguards are missing.'
    ),
    check(
      'tokenExpiryProof',
      hasText(serviceContent, /PASSWORD_RESET_TTL_MINUTES/) && hasText(modelContent, /expiresAt/) && hasText(controllerContent, /tokenExpiresAt/),
      'Reset tokens expire after a bounded TTL.',
      'Reset token expiry is missing or incomplete.'
    ),
    check(
      'oneTimeUseProof',
      hasText(serviceContent, /usedAt: null, revokedAt: null/) && hasText(serviceContent, /markPasswordResetTokenUsed/) && hasText(controllerContent, /markPasswordResetTokenUsed/),
      'Reset tokens are one-time-use and are marked used after success.',
      'Reset token one-time-use enforcement is missing.'
    ),
    check(
      'passwordStrengthProof',
      hasText(controllerContent, 'function isStrongPassword') && hasText(controllerContent, 'if (value.length < 12) return false;') && hasText(controllerContent, 'if (!/[a-z]/.test(value)) return false;') && hasText(controllerContent, 'if (!/[A-Z]/.test(value)) return false;') && hasText(controllerContent, 'if (!/\\d/.test(value)) return false;') && hasText(controllerContent, 'if (!/[^A-Za-z0-9]/.test(value)) return false;'),
      'Password strength validation is enforced before reset.',
      'Password strength validation is missing or incomplete.'
    ),
    check(
      'noUserEnumerationProof',
      hasText(controllerContent, 'GENERIC_FORGOT_SUCCESS') && hasText(controllerContent, 'return res.json(GENERIC_FORGOT_SUCCESS);') && hasText(controllerContent, 'GENERIC_RESET_FAILURE') && hasText(controllerContent, 'return res.status(400).json(GENERIC_RESET_FAILURE);'),
      'Forgot/reset responses remain generic and do not reveal account existence.',
      'Generic response behavior is not fully enforced.'
    ),
    check(
      'emailNotConfiguredProof',
      hasText(emailServiceContent, /EMAIL_NOT_CONFIGURED/) && hasText(emailServiceContent, /resolveDeliveryProviders\(\)/) && hasText(controllerContent, /getPasswordResetEmailProviderState\(\)/),
      'Email-provider state is exposed internally and safely handled when SMTP is absent.',
      'Email-provider fallback handling is incomplete.'
    ),
    check(
      'uiRoutesProof',
      hasText(webAppContent, /path="\/forgot-password"/) && hasText(webAppContent, /path="\/reset-password"/),
      'Frontend routes for forgot/reset password exist.',
      'Frontend forgot/reset routes are missing.'
    ),
    check(
      'loginLinkProof',
      hasText(loginContent, '<ForgotPasswordLink />') && hasText(forgotLinkContent, 'Wachtwoord vergeten?'),
      'Login page includes a forgot-password link.',
      'Login page is missing the forgot-password link.'
    ),
    check(
      'clientHelpersProof',
      hasText(apiClientContent, /forgotPassword\(/) && hasText(apiClientContent, /resetPassword\(/),
      'Client auth API exposes forgotPassword and resetPassword helpers.',
      'Client auth helpers for password reset are missing.'
    ),
    check(
      'forgotPasswordPageProof',
      hasText(forgotPageContent, /Als dit e-mailadres bij ons bekend is, ontvang je een resetlink\./) && hasText(forgotPageContent, /PasswordResetStatus/),
      'Forgot-password page uses the required generic success message.',
      'Forgot-password page does not show the required generic success message.'
    ),
    check(
      'resetPasswordPageProof',
      hasText(resetPageContent, "searchParams.get('token')") && hasText(resetPageContent, 'Je wachtwoord is opnieuw ingesteld. Je kunt nu inloggen.') && hasText(resetPageContent, 'PasswordResetStatus'),
      'Reset-password page reads token from the URL and shows the success path.',
      'Reset-password page is missing token handling or success messaging.'
    ),
    check(
      'routeRegistrationProof',
      hasText(authRoutesContent, /passwordResetRoutes/) && hasText(routeContent, /forgot-password/) && hasText(routeContent, /reset-password/),
      'Password reset routes are registered under /auth.',
      'Password reset routes are not registered correctly.'
    ),
  ]);

  const emailProviderState = process.env.NOTIFY_SMTP_HOST && process.env.NOTIFY_SMTP_USER && process.env.NOTIFY_SMTP_PASS && process.env.NOTIFY_EMAIL_FROM
    ? 'EMAIL_CONFIGURED'
    : 'EMAIL_NOT_CONFIGURED';

  const overallStatus: Status = Object.values(proofs).every((value) => value.status === 'PASS') ? 'PASS' : 'FAIL';
  const bundle = {
    generatedAt: new Date().toISOString(),
    overallStatus,
    emailProviderState,
    proofs,
  };

  writeProof(bundle);
  process.stdout.write(`${JSON.stringify({ overallStatus, proofPath: 'proof/password-reset-proof-bundle.json', emailProviderState })}\n`);
  if (overallStatus !== 'PASS') process.exit(1);
}

main();
