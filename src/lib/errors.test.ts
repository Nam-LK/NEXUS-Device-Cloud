import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
import { toApiError } from './errors';

describe('toApiError', () => {
  it('reports a network error when there is no response', () => {
    const result = toApiError(new AxiosError('Network Error', 'ERR_NETWORK'));
    expect(result.isNetworkError).toBe(true);
    expect(result.message).toMatch(/Cannot reach the backend/);
  });

  it('reads detail, correlationId and field errors from a problem+json body', () => {
    const error = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
      data: {
        detail: 'Request validation failed.',
        correlationId: 'abc-123',
        errors: [{ field: 'name', message: 'must not be blank' }],
      },
    });
    const result = toApiError(error);
    expect(result.status).toBe(400);
    expect(result.correlationId).toBe('abc-123');
    expect(result.fieldErrors).toEqual([{ field: 'name', message: 'must not be blank' }]);
    expect(result.isNetworkError).toBe(false);
  });

  it('handles non-Axios errors', () => {
    expect(toApiError(new Error('boom')).message).toBe('boom');
  });
});
