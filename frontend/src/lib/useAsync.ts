import { useCallback, useEffect, useState, type DependencyList } from 'react';
import { toApiError, type ApiError } from './errors';

interface AsyncState<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
}

/** Hook tải dữ liệu nhỏ gọn: loading / error / data + reload. Bỏ qua kết quả của request đã bị thay thế. */
export function useAsync<T>(load: () => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, loading: true });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    load()
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ data: null, error: toApiError(error), loading: false });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);
  return { ...state, reload };
}
