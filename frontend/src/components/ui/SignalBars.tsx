import type { ConnectivityStatus } from '../../types/api';
import { humanize } from '../../lib/formatters';

const LEVELS: Record<ConnectivityStatus, { filled: number; bar: string; text: string }> = {
  ONLINE: { filled: 4, bar: 'bg-emerald-600', text: 'text-emerald-800' },
  DEGRADED: { filled: 2, bar: 'bg-amber-500', text: 'text-amber-800' },
  OFFLINE: { filled: 0, bar: 'bg-rose-600', text: 'text-rose-800' },
  UNKNOWN: { filled: 0, bar: 'bg-slate-400', text: 'text-slate-600' },
};

/** Chỉ báo kết nối kiểu "vạch sóng": số vạch + chữ, không chỉ dựa vào màu. */
export function SignalBars({ status }: { status: ConnectivityStatus }) {
  const level = LEVELS[status];
  return (
    <span className="inline-flex items-center gap-2" data-testid="signal-bars">
      <span className="inline-flex h-4 items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            style={{ height: `${step * 25}%` }}
            className={`w-1 rounded-sm ${step <= level.filled ? level.bar : 'bg-slate-300'}`}
          />
        ))}
      </span>
      <span className={`text-sm font-medium ${level.text}`}>{humanize(status)}</span>
    </span>
  );
}
