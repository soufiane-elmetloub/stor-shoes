// API Error Classes for better error handling

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string,
    public responseData?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }

  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  isForbidden(): boolean {
    return this.statusCode === 403;
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public originalError: Error,
    public endpoint: string
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends ApiError {
  public errors: Record<string, string[]>;

  constructor(
    message: string,
    endpoint: string,
    errors: Record<string, string[]>
  ) {
    super(message, 422, endpoint, { errors });
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class TimeoutError extends Error {
  constructor(
    message: string,
    public timeoutMs: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Error user messages in multiple languages
export const errorMessages = {
  en: {
    network: 'Unable to connect to server. Please check your internet connection.',
    notFound: 'The requested resource was not found.',
    serverError: 'Server error occurred. Please try again later.',
    unauthorized: 'You need to log in to access this resource.',
    forbidden: 'You do not have permission to access this resource.',
    validation: 'Please check your input and try again.',
    rateLimit: 'Too many requests. Please wait a moment.',
    timeout: 'Request timed out. Please try again.',
    unknown: 'An unexpected error occurred. Please try again.',
  },
  ar: {
    network: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
    notFound: 'لم يتم العثور على المورد المطلوب.',
    serverError: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.',
    unauthorized: 'يجب تسجيل الدخول للوصول إلى هذا المورد.',
    forbidden: 'ليس لديك إذن للوصول إلى هذا المورد.',
    validation: 'يرجى التحقق من إدخالك والمحاولة مرة أخرى.',
    rateLimit: 'طلبات كثيرة جداً. يرجى الانتظار قليلاً.',
    timeout: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
    unknown: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
  },
};

// Get user-friendly error message
export function getErrorMessage(error: Error, lang: 'en' | 'ar' = 'en'): string {
  const messages = errorMessages[lang];

  if (error instanceof NetworkError) {
    return messages.network;
  }
  if (error instanceof RateLimitError) {
    return messages.rateLimit;
  }
  if (error instanceof TimeoutError) {
    return messages.timeout;
  }
  if (error instanceof ValidationError) {
    return messages.validation;
  }
  if (error instanceof ApiError) {
    if (error.isNotFound()) return messages.notFound;
    if (error.isUnauthorized()) return messages.unauthorized;
    if (error.isForbidden()) return messages.forbidden;
    if (error.isServerError()) return messages.serverError;
  }

  return messages.unknown;
}

// Error logging for debugging
export function logError(error: Error, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  // In production, send to error tracking service (e.g., Sentry)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error tracking service
    // Example: Sentry.captureException(error, { extra: context });
  }
}
