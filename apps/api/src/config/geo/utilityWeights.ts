export const UTILITY_WEIGHTS = {
  electricity: {
    available: 20,
    partial: 12,
    unavailable: 0,
  },
  water: {
    available: 20,
    partial: 12,
    unavailable: 0,
  },
  sewage: {
    available: 18,
    partial: 10,
    unavailable: 0,
  },
  natural_gas: {
    available: 15,
    partial: 8,
    unavailable: 0,
  },
  internet_fiber: {
    available: 12,
    partial: 6,
    unavailable: 0,
  },
} as const;

export const UTILITY_KEYWORDS = {
  available: ['yes', 'available', 'var', 'connected', 'on-site', 'existing'],
  partial: ['partial', 'kismen', 'near', 'planned', 'close'],
  unavailable: ['no', 'none', 'yok', 'not available', 'unavailable'],
} as const;

export const UTILITY_MAX_SCORE = 85;
