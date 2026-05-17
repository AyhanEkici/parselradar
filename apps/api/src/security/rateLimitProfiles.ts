export const RATE_LIMIT_PROFILES = {
  publicRead: {
    windowMs: 60_000,
    limit: 120,
  },
  authenticated: {
    windowMs: 60_000,
    limit: 300,
  },
  admin: {
    windowMs: 60_000,
    limit: 600,
  },
  sensitiveAuth: {
    windowMs: 60_000,
    limit: 30,
  },
} as const;
