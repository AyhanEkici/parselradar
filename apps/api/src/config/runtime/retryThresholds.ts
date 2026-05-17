export const RETRY_THRESHOLDS = {
  analysis: { attempts: 3, backoffMs: 3000 },
  market: { attempts: 4, backoffMs: 5000 },
  geo: { attempts: 4, backoffMs: 5000 },
  alert: { attempts: 2, backoffMs: 2000 },
  ingestion: { attempts: 5, backoffMs: 7000 },
} as const;
