import nodemailer from 'nodemailer';

export type PasswordResetEmailState = 'EMAIL_NOT_CONFIGURED' | 'EMAIL_CONFIGURED' | 'EMAIL_SENT' | 'EMAIL_FAILED';

type PasswordResetEmailInput = {
  toEmail: string;
  resetLink: string;
};

function envValue(...keys: string[]) {
  for (const key of keys) {
    const value = String(process.env[key] || '').trim();
    if (value) return value;
  }
  return '';
}

function resolveSmtpConfig() {
  const host = envValue('SMTP_HOST', 'NOTIFY_SMTP_HOST');
  const user = envValue('SMTP_USER', 'NOTIFY_SMTP_USER');
  const pass = envValue('SMTP_PASS', 'NOTIFY_SMTP_PASS');
  const from = envValue('SMTP_FROM', 'NOTIFY_EMAIL_FROM');
  const portRaw = envValue('SMTP_PORT', 'NOTIFY_SMTP_PORT');
  const secureRaw = envValue('SMTP_SECURE', 'NOTIFY_SMTP_SECURE');
  return {
    host,
    user,
    pass,
    from,
    port: Number(portRaw || 587),
    secure: String(secureRaw || '').toLowerCase() === 'true',
  };
}

export function getPasswordResetEmailProviderState(): { configured: boolean; state: PasswordResetEmailState } {
  const smtp = resolveSmtpConfig();
  const configured = Boolean(smtp.host && smtp.user && smtp.pass && smtp.from);
  return configured
    ? { configured: true, state: 'EMAIL_CONFIGURED' }
    : { configured: false, state: 'EMAIL_NOT_CONFIGURED' };
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput) {
  const provider = getPasswordResetEmailProviderState();
  if (!provider.configured) {
    return { state: provider.state };
  }

  try {
    const smtp = resolveSmtpConfig();
    const transport = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });

    await transport.sendMail({
      from: smtp.from,
      to: input.toEmail,
      subject: 'ParselRadar wachtwoord resetten',
      text: `Reset your password: ${input.resetLink}`,
      html: `<p>Reset your password:</p><p><a href="${input.resetLink}">${input.resetLink}</a></p>`,
    });

    return { state: 'EMAIL_SENT' as const };
  } catch {
    return { state: 'EMAIL_FAILED' as const };
  }
}
