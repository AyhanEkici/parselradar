export type RetryOutcome = {
  response: Response;
  retryAttempts: number;
  retryReasons: string[];
};

export type RetryableFetchOptions = {
  maxRetries?: number;
  timeoutMs?: number;
  initialBackoffMs?: number;
};

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_INITIAL_BACKOFF_MS = 300;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('REQUEST_TIMEOUT'), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

function isTransientStatus(status: number) {
  return status === 408 || status === 425 || status === 429 || (status >= 500 && status <= 599);
}

export function isSafeRetryMethod(method?: string) {
  return String(method || 'GET').toUpperCase() === 'GET';
}

export async function retryableFetch(url: string, init: RequestInit = {}, options: RetryableFetchOptions = {}): Promise<RetryOutcome> {
  const method = String(init.method || 'GET').toUpperCase();
  const maxRetries = Math.max(0, options.maxRetries ?? DEFAULT_MAX_RETRIES);
  const timeoutMs = Math.max(1000, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const initialBackoffMs = Math.max(100, options.initialBackoffMs ?? DEFAULT_INITIAL_BACKOFF_MS);

  const retryReasons: string[] = [];
  let attempt = 0;

  while (attempt <= maxRetries) {
    const timeout = withTimeout(timeoutMs);
    try {
      const headers = new Headers(init.headers || {});
      headers.set('X-Client-Retry-Attempts', String(attempt));

      const response = await fetch(url, { ...init, method, headers, signal: timeout.signal });
      timeout.clear();

      const remaining = maxRetries - attempt;
      if (isSafeRetryMethod(method) && isTransientStatus(response.status) && remaining > 0) {
        retryReasons.push(`status:${response.status}`);
        const backoff = initialBackoffMs * Math.pow(2, attempt);
        await wait(backoff);
        attempt += 1;
        continue;
      }

      return {
        response,
        retryAttempts: attempt,
        retryReasons,
      };
    } catch (err) {
      timeout.clear();
      const remaining = maxRetries - attempt;
      const transient = isSafeRetryMethod(method);
      const reason = err instanceof Error ? err.message : String(err || 'NETWORK_ERROR');

      if (transient && remaining > 0) {
        retryReasons.push(`network:${reason}`);
        const backoff = initialBackoffMs * Math.pow(2, attempt);
        await wait(backoff);
        attempt += 1;
        continue;
      }

      throw {
        error: 'Network request failed',
        reason,
        retryAttempts: attempt,
        retryReasons,
      };
    }
  }

  throw {
    error: 'Retry limit exceeded',
    retryAttempts: maxRetries,
    retryReasons,
  };
}
