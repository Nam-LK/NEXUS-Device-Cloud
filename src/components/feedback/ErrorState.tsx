import type { ApiError } from '../../lib/errors';

interface ErrorStateProps {
  error: Pick<ApiError, 'message' | 'correlationId'>;
  title?: string;
  onRetry?: () => void;
}

export function ErrorState({ error, title = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-5">
      <h2 className="text-sm font-semibold text-rose-900">{title}</h2>
      <p className="mt-1 text-sm text-rose-800">{error.message}</p>
      {error.correlationId && (
        <p className="mt-2 font-mono text-xs text-rose-700">Reference: {error.correlationId}</p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md bg-rose-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-900"
        >
          Try again
        </button>
      )}
    </div>
  );
}
