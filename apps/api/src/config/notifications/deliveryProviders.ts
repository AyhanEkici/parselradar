export function resolveDeliveryProviders() {
  const emailConfigured = Boolean(
    process.env.NOTIFY_EMAIL_FROM &&
      process.env.NOTIFY_SMTP_HOST &&
      process.env.NOTIFY_SMTP_USER &&
      process.env.NOTIFY_SMTP_PASS
  );

  return {
    email: {
      configured: emailConfigured,
      providerName: emailConfigured ? 'stub-email' : 'none',
    },
  };
}
