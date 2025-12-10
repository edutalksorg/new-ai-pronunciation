import { STORAGE_KEYS } from '../constants';

// API Error Handling
export const extractErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.data?.message) return error.data.message;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.statusText) return error.response.statusText;
  return 'An unexpected error occurred';
};

export const getHttpStatusMessage = (status: number): string => {
  const messages: Record<number, string> = {
    400: 'Bad Request - Invalid data',
    401: 'Unauthorized - Please login again',
    403: 'Forbidden - You do not have permission',
    404: 'Not Found - Resource does not exist',
    409: 'Conflict - Resource already exists',
    422: 'Validation Error - Check your inputs',
    429: 'Too Many Requests - Please try again later',
    500: 'Server Error - Please try again later',
    502: 'Bad Gateway - Service unavailable',
    503: 'Service Unavailable - Please try again later',
  };
  return messages[status] || `Error ${status}`;
};

export const isApiError = (error: any): boolean => {
  return error?.response?.status !== undefined;
};

export const isNetworkError = (error: any): boolean => {
  return error?.message === 'Network Error' || error?.code === 'ERR_NETWORK';
};

export const isTimeoutError = (error: any): boolean => {
  return error?.code === 'ECONNABORTED' || error?.message?.includes('timeout');
};

export const handleApiError = (error: any): { message: string; status?: number; isNetwork: boolean } => {
  if (isNetworkError(error)) {
    return {
      message: 'Network connection failed. Please check your internet.',
      isNetwork: true,
    };
  }

  if (isTimeoutError(error)) {
    return {
      message: 'Request timeout. Please try again.',
      isNetwork: false,
    };
  }

  if (isApiError(error)) {
    const status = error.response.status;
    const message = extractErrorMessage(error);
    return {
      message: message || getHttpStatusMessage(status),
      status,
      isNetwork: false,
    };
  }

  return {
    message: extractErrorMessage(error),
    isNetwork: false,
  };
};

// API Response Handling
export const unwrapApiResponse = (response: any): any => {
  return response?.data || response;
};

export const validateApiResponse = (response: any): boolean => {
  return response !== null && response !== undefined;
};

export const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
  const flattened: Record<string, any> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
  }

  return flattened;
};

export const filterObjectByKeys = (obj: any, keys: string[]): Record<string, any> => {
  const filtered: Record<string, any> = {};
  keys.forEach(key => {
    if (key in obj) {
      filtered[key] = obj[key];
    }
  });
  return filtered;
};

export const pickObjectKeys = (obj: any, keys: string[]): Record<string, any> => {
  return filterObjectByKeys(obj, keys);
};

export const omitObjectKeys = (obj: any, keys: string[]): Record<string, any> => {
  const omitted: Record<string, any> = { ...obj };
  keys.forEach(key => {
    delete omitted[key];
  });
  return omitted;
};

// Token Management
export const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }
  return null;
};

export const getStoredRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
  return null;
};

export const getStoredUser = (): any => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        return null;
      }
    }
  }
  return null;
};

export const setStoredToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }
};

export const setStoredRefreshToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }
};

export const setStoredUser = (user: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
};

export const clearStoredTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const decoded = JSON.parse(atob(parts[1]));
    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiryTime;
  } catch (err) {
    console.error('Failed to decode token:', err);
    return true;
  }
};

export const getTokenExpiryTime = (token: string): number | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(atob(parts[1]));
    return decoded.exp * 1000; // Return in milliseconds
  } catch (err) {
    console.error('Failed to decode token:', err);
    return null;
  }
};

// Request Queue Management
export const createRequestQueue = () => {
  let queue: Array<() => Promise<any>> = [];
  let isProcessing = false;

  const add = async <T>(fn: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!isProcessing) {
        process();
      }
    });
  };

  const process = async () => {
    if (isProcessing || queue.length === 0) return;

    isProcessing = true;
    while (queue.length > 0) {
      const fn = queue.shift();
      if (fn) {
        try {
          await fn();
        } catch (error) {
          console.error('Error processing queue item:', error);
        }
      }
    }
    isProcessing = false;
  };

  return { add, process };
};

// API Retry Logic
export const shouldRetry = (error: any, attempt: number, maxRetries: number): boolean => {
  if (attempt >= maxRetries) return false;

  // Retry on network errors
  if (isNetworkError(error)) return true;

  // Retry on timeout
  if (isTimeoutError(error)) return true;

  // Retry on 5xx server errors
  if (isApiError(error)) {
    const status = error.response.status;
    return status >= 500 && status < 600;
  }

  return false;
};

export const calculateBackoffDelay = (attempt: number, baseDelay: number = 1000): number => {
  // Exponential backoff with jitter: baseDelay * 2^attempt + random jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return exponentialDelay + jitter;
};
