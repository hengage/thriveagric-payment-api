import { HTTP_STATUS } from '../constants/httpStatus';
import { ApiError, ApiSuccessResponse, JSONValue } from '../types';
import { HandleException } from './handleException.utils';

const createApiResponse = <T = JSONValue | null>({
  status,
  message,
  data,
  error,
}: {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error?: {
    name: string;
    code: number;
    message: string;
    details?: Record<string, unknown>;
  };
}): ApiSuccessResponse<T> | ApiError => {
  if (error) {
    return { status: 'error', error };
  }
  return { status: 'success', data: data as T, ...(message && { message }) };
};

export const createErrorResponse = (
  error: HandleException,
  details?: Record<string, unknown>
): ApiError =>
  createApiResponse({
    status: 'error',
    error: {
      name: error.name,
      code: error.status,
      message: error.message,
      ...(details && { details }),
    },
  }) as ApiError;

export const createSuccessResponse = <T = JSONValue | null>(
  message: string,
  data?: T
): ApiSuccessResponse<T> =>
  createApiResponse({ status: 'success', data, message }) as ApiSuccessResponse<T>;
