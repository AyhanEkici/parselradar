export const SECURITY_POLICIES = {
  fingerprintSalt: 'parselradar-runtime-v10',
  suspiciousWindowMinutes: 10,
  maxRapidRequests: 80,
  maxDistinctRoutesPerWindow: 28,
  blockOnCriticalSignal: false,
} as const;
