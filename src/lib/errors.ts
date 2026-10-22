import axios from 'axios';

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  status?: number;
  correlationId?: string;
  fieldErrors: FieldError[];
  /** true khi không nhận được phản hồi nào (backend tắt, sai địa chỉ, mất mạng). */
  isNetworkError: boolean;
}

interface ProblemBody {
  detail?: unknown;
  correlationId?: unknown;
  errors?: unknown;
}

function parseFieldErrors(value: unknown): FieldError[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): FieldError[] => {
    if (item && typeof item === 'object' && 'field' in item && 'message' in item) {
      const { field, message } = item as { field: unknown; message: unknown };
      return [{ field: String(field), message: String(message) }];
    }
    return [];
  });
}

/** Chuyển mọi lỗi (Axios hoặc khác) thành một cấu trúc thống nhất để giao diện hiển thị. */
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return {
        message: 'Cannot reach the backend. Check that it is running on http://localhost:8080.',
        fieldErrors: [],
        isNetworkError: true,
      };
    }
    const body = (error.response.data ?? {}) as ProblemBody;
    return {
      message: typeof body.detail === 'string' ? body.detail : `Request failed with status ${error.response.status}.`,
      status: error.response.status,
      correlationId: typeof body.correlationId === 'string' ? body.correlationId : undefined,
      fieldErrors: parseFieldErrors(body.errors),
      isNetworkError: false,
    };
  }
  return {
    message: error instanceof Error ? error.message : 'Unexpected error.',
    fieldErrors: [],
    isNetworkError: false,
  };
}
