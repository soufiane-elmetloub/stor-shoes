'use client';

import { useState, useCallback } from 'react';
import { storeApi, getErrorMessage } from './api';
import type { ApiError, NetworkError, ValidationError, RateLimitError, TimeoutError } from './api-errors';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | NetworkError | ValidationError | RateLimitError | TimeoutError | Error | null;
  errorMessage: string;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
  retry: () => Promise<T | null>;
}

// Generic hook for API calls with error handling
export function useApi<T>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    errorLanguage?: 'en' | 'ar';
  } = {}
): UseApiReturn<T> {
  const { onSuccess, onError, errorLanguage = 'en' } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    errorMessage: '',
  });

  const [lastArgs, setLastArgs] = useState<unknown[]>([]);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setLastArgs(args);
      setState((prev) => ({ ...prev, loading: true, error: null, errorMessage: '' }));

      try {
        const result = await apiFunction(...args);
        setState({
          data: result,
          loading: false,
          error: null,
          errorMessage: '',
        });
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        const message = getErrorMessage(error, errorLanguage);

        setState({
          data: null,
          loading: false,
          error: error as ApiError | NetworkError | ValidationError | RateLimitError | TimeoutError | Error,
          errorMessage: message,
        });
        onError?.(error);
        return null;
      }
    },
    [apiFunction, onSuccess, onError, errorLanguage]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      errorMessage: '',
    });
    setLastArgs([]);
  }, []);

  const retry = useCallback(async (): Promise<T | null> => {
    if (lastArgs.length > 0) {
      return execute(...lastArgs);
    }
    return null;
  }, [execute, lastArgs]);

  return {
    ...state,
    execute,
    reset,
    retry,
  };
}

// Pre-configured hooks for common API calls
export function useGetProducts() {
  return useApi(storeApi.getProducts as (...args: unknown[]) => Promise<unknown>, {
    errorLanguage: 'en',
  });
}

export function useGetProductBySlug() {
  return useApi(storeApi.getProductBySlug as (...args: unknown[]) => Promise<unknown>, {
    errorLanguage: 'en',
  });
}

export function useGetCategories() {
  return useApi(storeApi.getCategories as (...args: unknown[]) => Promise<unknown>, {
    errorLanguage: 'en',
  });
}

export function useCreateOrder() {
  return useApi(storeApi.createOrder as (...args: unknown[]) => Promise<unknown>, {
    errorLanguage: 'en',
  });
}
