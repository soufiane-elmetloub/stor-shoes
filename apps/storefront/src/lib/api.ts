import { ApiError, NetworkError, ValidationError, RateLimitError, TimeoutError, logError, getErrorMessage } from './api-errors';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

export const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL.replace('/api', '')}${url}`;
};

// Rate Limiting Configuration
const RATE_LIMIT = {
  // Max requests per window
  MAX_REQUESTS: 30,
  // Time window in milliseconds (1 minute)
  WINDOW_MS: 60000,
  // Delay between requests in ms (minimum)
  MIN_DELAY_MS: 100,
  // Max retry attempts for rate limited requests
  MAX_RETRIES: 3,
  // Exponential backoff base delay
  BACKOFF_BASE_MS: 1000,
};

// Request tracking for rate limiting
interface RequestLog {
  timestamp: number;
  endpoint: string;
}

interface RateLimitState {
  requests: RequestLog[];
  lastRequestTime: number;
  queue: Array<() => void>;
}

const rateLimitState: RateLimitState = {
  requests: [],
  lastRequestTime: 0,
  queue: [],
};

// Clean old requests outside the window
function cleanOldRequests(): void {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.WINDOW_MS;
  rateLimitState.requests = rateLimitState.requests.filter(
    (req) => req.timestamp > windowStart
  );
}

// Check if we can make a request
function canMakeRequest(): boolean {
  cleanOldRequests();
  return rateLimitState.requests.length < RATE_LIMIT.MAX_REQUESTS;
}

// Calculate wait time for next available slot
function getWaitTime(): number {
  cleanOldRequests();
  if (rateLimitState.requests.length < RATE_LIMIT.MAX_REQUESTS) {
    const timeSinceLastRequest = Date.now() - rateLimitState.lastRequestTime;
    return Math.max(0, RATE_LIMIT.MIN_DELAY_MS - timeSinceLastRequest);
  }
  // Wait until oldest request expires
  const oldestRequest = rateLimitState.requests[0];
  return oldestRequest.timestamp + RATE_LIMIT.WINDOW_MS - Date.now();
}

// Wait for rate limit slot
async function waitForSlot(): Promise<void> {
  const waitTime = getWaitTime();
  if (waitTime > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
}

// Record a request
function recordRequest(endpoint: string): void {
  rateLimitState.requests.push({
    timestamp: Date.now(),
    endpoint,
  });
  rateLimitState.lastRequestTime = Date.now();
}

// Exponential backoff delay
function getBackoffDelay(attempt: number): number {
  return RATE_LIMIT.BACKOFF_BASE_MS * Math.pow(2, attempt - 1);
}

// Re-export error classes
export { ApiError, NetworkError, ValidationError, RateLimitError, TimeoutError, getErrorMessage };

// Main fetch function with rate limiting
export async function fetchApi(
  endpoint: string,
  options?: RequestInit,
  retryAttempt = 0
): Promise<unknown> {
  // Check if we've hit the rate limit
  if (!canMakeRequest()) {
    if (retryAttempt >= RATE_LIMIT.MAX_RETRIES) {
      const waitTime = getWaitTime();
      throw new RateLimitError(
        `Rate limit exceeded for ${endpoint}. Try again in ${Math.ceil(waitTime / 1000)}s`,
        waitTime,
        endpoint
      );
    }
    // Wait for a slot to open
    await waitForSlot();
  }

  // Ensure minimum delay between requests
  const timeSinceLastRequest = Date.now() - rateLimitState.lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT.MIN_DELAY_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, RATE_LIMIT.MIN_DELAY_MS - timeSinceLastRequest)
    );
  }

  // Record this request
  recordRequest(endpoint);

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    // Handle 429 Too Many Requests
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('Retry-After') || '60', 10) * 1000;

      if (retryAttempt < RATE_LIMIT.MAX_RETRIES) {
        const delay = Math.max(retryAfter, getBackoffDelay(retryAttempt + 1));
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchApi(endpoint, options, retryAttempt + 1);
      }

      throw new RateLimitError(
        `Rate limit exceeded for ${endpoint}`,
        retryAfter,
        endpoint
      );
    }

    if (!res.ok) {
      let errorData: unknown;
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: res.statusText };
      }

      // Handle specific error types
      if (res.status === 422 && errorData && typeof errorData === 'object' && 'errors' in errorData) {
        throw new ValidationError(
          'Validation failed',
          endpoint,
          (errorData as { errors: Record<string, string[]> }).errors
        );
      }

      throw new ApiError(
        (errorData && typeof errorData === 'object' && 'message' in errorData)
          ? String((errorData as { message: string }).message)
          : `Request failed with status ${res.status}`,
        res.status,
        endpoint,
        errorData
      );
    }

    return res.json();
  } catch (error) {
    // Don't wrap our own errors
    if (error instanceof ApiError || error instanceof RateLimitError) {
      logError(error, { endpoint, retryAttempt });
      throw error;
    }

    // Handle timeout
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new TimeoutError(
        `Request to ${endpoint} timed out after ${REQUEST_TIMEOUT}ms`,
        REQUEST_TIMEOUT,
        endpoint
      );
      logError(timeoutError, { endpoint });
      throw timeoutError;
    }

    // Retry on network errors (with backoff)
    if (
      error instanceof TypeError &&
      retryAttempt < RATE_LIMIT.MAX_RETRIES
    ) {
      const delay = getBackoffDelay(retryAttempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchApi(endpoint, options, retryAttempt + 1);
    }

    // Wrap other errors as NetworkError
    const networkError = new NetworkError(
      `Network error while accessing ${endpoint}`,
      error instanceof Error ? error : new Error(String(error)),
      endpoint
    );
    logError(networkError, { endpoint, originalError: error });
    throw networkError;
  }
}

// Get current rate limit status (for monitoring)
export function getRateLimitStatus(): {
  requestsInWindow: number;
  maxRequests: number;
  windowMs: number;
  remainingRequests: number;
  isLimited: boolean;
  waitTimeMs: number;
} {
  cleanOldRequests();
  const requestsInWindow = rateLimitState.requests.length;
  return {
    requestsInWindow,
    maxRequests: RATE_LIMIT.MAX_REQUESTS,
    windowMs: RATE_LIMIT.WINDOW_MS,
    remainingRequests: Math.max(0, RATE_LIMIT.MAX_REQUESTS - requestsInWindow),
    isLimited: requestsInWindow >= RATE_LIMIT.MAX_REQUESTS,
    waitTimeMs: getWaitTime(),
  };
}

// Reset rate limit (for testing)
export function resetRateLimit(): void {
  rateLimitState.requests = [];
  rateLimitState.lastRequestTime = 0;
  rateLimitState.queue = [];
}

// API endpoints
export const storeApi = {
  getProducts: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/products${query}`);
  },
  getFeaturedProducts: () => fetchApi('/products/featured'),
  getProductBySlug: (slug: string) => fetchApi(`/products/slug/${slug}`),
  getCategories: () => fetchApi('/categories'),
  createOrder: (data: unknown) =>
    fetchApi('/orders', { method: 'POST', body: JSON.stringify(data) }),
  submitContactForm: (data: { name: string; email: string; phone: string; message: string }) =>
    fetchApi('/contact', { method: 'POST', body: JSON.stringify(data) }),
};

// Analytics API
export const analyticsApi = {
  trackVisit: (data: {
    page: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    productId?: string;
    referrer?: string;
  }) =>
    fetchApi('/analytics/track-visit', { method: 'POST', body: JSON.stringify(data) }),
  trackConversion: (data: { orderId: string; utmSource?: string; value: number }) =>
    fetchApi('/analytics/track-conversion', { method: 'POST', body: JSON.stringify(data) }),
};

