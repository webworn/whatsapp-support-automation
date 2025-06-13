import { Logger } from '@nestjs/common';

export interface RetryOptions {
  attempts: number;
  delay: number;
  backoff?: 'fixed' | 'exponential' | 'linear';
  maxDelay?: number;
  retryIf?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number) => void;
}

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> => {
  const {
    attempts,
    delay: initialDelay,
    backoff = 'exponential',
    maxDelay = 30000,
    retryIf = () => true,
    onRetry,
  } = options;

  const logger = new Logger('RetryUtil');
  let lastError: any;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === attempts || !retryIf(error)) {
        throw error;
      }

      let delay = initialDelay;

      switch (backoff) {
        case 'exponential':
          delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);
          break;
        case 'linear':
          delay = Math.min(initialDelay * attempt, maxDelay);
          break;
        case 'fixed':
        default:
          delay = initialDelay;
          break;
      }

      // Add jitter to prevent thundering herd
      delay = delay + Math.random() * 1000;

      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
        error: error.message,
        attempt,
        maxAttempts: attempts,
      });

      if (onRetry) {
        onRetry(error, attempt);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

export const isRetryableError = (error: any): boolean => {
  // Network errors
  if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return true;
  }

  // HTTP errors that should be retried
  if (error.response?.status) {
    const status = error.response.status;
    return status >= 500 || status === 429 || status === 408;
  }

  // Timeout errors
  if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
    return true;
  }

  return false;
};

export const createRetryableFunction = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions,
) => {
  return (...args: T): Promise<R> => {
    return retryWithBackoff(() => fn(...args), options);
  };
};