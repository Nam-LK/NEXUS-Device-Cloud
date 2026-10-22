import { useEffect } from 'react';
import { useAsync } from '../../lib/useAsync';
import { fetchSystemHealth } from './systemApi';

/** Kiểm tra backend + database định kỳ và hiển thị kết quả thật (không giả lập). */
export function BackendStatus({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const { data, error, loading, reload } = useAsync(fetchSystemHealth, []);

  useEffect(() => {
    const timer = window.setInterval(reload, 15_000);
    return () => window.clearInterval(timer);
  }, [reload]);

  let dot = 'bg-slate-400';
  let label = 'Checking backend…';
  if (!loading || data || error) {
    if (error) {
      dot = 'bg-rose-500';
      label = error.isNetworkError ? 'Backend unreachable' : 'Backend error';
    } else if (data?.status === 'UP') {
      dot = 'bg-emerald-500';
      label = 'Backend and database connected';
    } else if (data) {
      dot = 'bg-amber-500';
      label = 'Backend up, database down';
    }
  }

  return (
    <div role="status" className={`flex items-center gap-2 text-xs ${tone === 'dark' ? 'text-petrol-200' : 'text-slate-600'}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </div>
  );
}
