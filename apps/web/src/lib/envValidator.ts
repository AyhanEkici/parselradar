type FrontendEnvDiagnostics = {
  valid: boolean;
  apiUrl: string;
  warnings: string[];
};

const LOCAL_API_URL = 'http://localhost:4000';
const PRODUCTION_API_URL = 'https://parselradar-production.up.railway.app';

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '');
}

function looksLikeFrontendHost(value: string) {
  try {
    const url = new URL(value);
    return /vercel\.app$/i.test(url.hostname);
  } catch {
    return false;
  }
}

export function validateFrontendEnv(): FrontendEnvDiagnostics {
  const warnings: string[] = [];
  const configured = String(import.meta.env.VITE_API_URL || '').trim();

  if (!configured) {
    warnings.push('VITE_API_URL missing, using runtime fallback policy.');
  }

  if (configured && looksLikeFrontendHost(configured)) {
    warnings.push('VITE_API_URL points to a frontend host; falling back to safe API defaults.');
  }

  let apiUrl = configured ? normalizeBaseUrl(configured) : '';

  if (!apiUrl || looksLikeFrontendHost(apiUrl)) {
    if (typeof window !== 'undefined' && /vercel\.app$/i.test(window.location.hostname)) {
      apiUrl = PRODUCTION_API_URL;
    } else {
      apiUrl = LOCAL_API_URL;
    }
  }

  return {
    valid: warnings.length === 0,
    apiUrl,
    warnings,
  };
}
