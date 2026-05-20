import nodemailer from 'nodemailer';
import { resolveDeliveryProviders } from '../../config/notifications/deliveryProviders';

export type PasswordResetEmailState = 'EMAIL_NOT_CONFIGURED' | 'EMAIL_CONFIGURED' | 'EMAIL_SENT' | 'EMAIL_FAILED';

type PasswordResetEmailInput = {
  toEmail: string;
  resetLink: string;
};

export function getPasswordResetEmailProviderState(): { configured: boolean; state: PasswordResetEmailState } {
  const providers = resolveDeliveryProviders();
  return providers.email.configured
    ? { configured: true, state: 'EMAIL_CONFIGURED' }
    : { configured: false, state: 'EMAIL_NOT_CONFIGURED' };
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput) {
  const provider = getPasswordResetEmailProviderState();
  if (!provider.configured) {
    return { state: provider.state };
  }

  try {
    const transport = nodemailer.createTransport({
      host: String(process.env.NOTIFY_SMTP_HOST || ''),
      port: Number(process.env.NOTIFY_SMTP_PORT || 587),
      secure: String(process.env.NOTIFY_SMTP_SECURE || '').toLowerCase() === 'true',
      auth: {
        user: String(process.env.NOTIFY_SMTP_USER || ''),
        pass: String(process.env.NOTIFY_SMTP_PASS || ''),
      },
    });

    await transport.sendMail({
      from: String(process.env.NOTIFY_EMAIL_FROM || 'no-reply@parselradar.app'),
      to: input.toEmail,
      subject: 'ParselRadar password reset',
      text: `Reset your password: ${input.resetLink}`,
      html: `<p>Reset your password:</p><p><a href="${input.resetLink}">${input.resetLink}</a></p>`,
    });

    return { state: 'EMAIL_SENT' as const };
  } catch {
    return { state: 'EMAIL_FAILED' as const };
  }
}
