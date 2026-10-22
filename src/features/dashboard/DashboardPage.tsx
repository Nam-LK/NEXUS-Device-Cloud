import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { formatDateTime, formatRelative, humanize } from '../../lib/formatters';
import { useAsync } from '../../lib/useAsync';
import { CONNECTIVITY_STATUSES, type ConnectivityStatus } from '../../types/api';
import { SignalBars } from '../../components/ui/SignalBars';
import { DemoBadge } from '../devices/StatusBadges';
import { searchDevices } from '../devices/devicesApi';
import { fetchDashboardSummary } from './dashboardApi';

const SEGMENT_COLORS: Record<ConnectivityStatus, string> = {
  ONLINE: 'bg-emerald-600',
  DEGRADED: 'bg-amber-500',
  OFFLINE: 'bg-rose-600',
  UNKNOWN: 'bg-slate-400',
};

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export function DashboardPage() {
  const summary = useAsync(fetchDashboardSummary, []);
  const recent = useAsync(() => searchDevices({ size: 5, sortBy: 'createdAt', direction: 'desc' }), []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-slate-600">Device inventory for your organization.</p>
      </div>

      {summary.loading && !summary.data && <LoadingState label="Loading overview…" />}
      {summary.error && <ErrorState error={summary.error} title="Could not load the overview" onRetry={summary.reload} />}

      {summary.data && (
        <>
          {summary.data.includesDemoData && (
            <p role="note" className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {summary.data.demoDevices} of {summary.data.totalDevices} devices are seeded <strong>demo data</strong>. Their
              connectivity values are fixed sample values, not live measurements. Live heartbeat tracking arrives with
              the device-connectivity release.
            </p>
          )}

          {summary.data.totalDevices === 0 ? (
            <EmptyState
              title="No devices yet"
              description="Register your first device to see it here."
              action={
                <Link to="/devices" className="rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800">
                  Go to devices
                </Link>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                <Stat label="Total devices" value={summary.data.totalDevices} hint={`${summary.data.siteCount} sites`} />
                <Stat label="Online" value={summary.data.connectivity.ONLINE} />
                <Stat label="Degraded" value={summary.data.connectivity.DEGRADED} />
                <Stat label="Offline" value={summary.data.connectivity.OFFLINE} />
                <Stat label="Disabled by operator" value={summary.data.adminStatus.DISABLED} />
              </div>

              <section className="rounded-lg border border-slate-200 bg-white p-4" aria-labelledby="connectivity-heading">
                <h2 id="connectivity-heading" className="text-sm font-semibold">
                  Connectivity breakdown
                </h2>
                <div className="mt-3 flex h-3 overflow-hidden rounded bg-slate-200" role="img"
                  aria-label={CONNECTIVITY_STATUSES.map((s) => `${humanize(s)} ${summary.data?.connectivity[s] ?? 0}`).join(', ')}>
                  {CONNECTIVITY_STATUSES.map((status) => {
                    const count = summary.data?.connectivity[status] ?? 0;
                    const width = (count / summary.data!.totalDevices) * 100;
                    return count > 0 ? <div key={status} style={{ width: `${width}%` }} className={SEGMENT_COLORS[status]} /> : null;
                  })}
                </div>
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-700">
                  {CONNECTIVITY_STATUSES.map((status) => (
                    <li key={status} className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-sm ${SEGMENT_COLORS[status]}`} aria-hidden="true" />
                      {humanize(status)}: {summary.data?.connectivity[status] ?? 0}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-slate-500">Generated {formatDateTime(summary.data.generatedAt)}</p>
              </section>
            </>
          )}
        </>
      )}

      <section aria-labelledby="recent-heading">
        <div className="flex items-center justify-between">
          <h2 id="recent-heading" className="text-sm font-semibold">
            Recently added devices
          </h2>
          <Link to="/devices" className="text-sm font-medium text-teal-700 hover:underline">
            View all devices
          </Link>
        </div>
        <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {recent.loading && !recent.data && <LoadingState />}
          {recent.error && (
            <div className="p-4">
              <ErrorState error={recent.error} onRetry={recent.reload} />
            </div>
          )}
          {recent.data && recent.data.items.length === 0 && <p className="p-4 text-sm text-slate-600">Nothing to show yet.</p>}
          {recent.data && recent.data.items.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {recent.data.items.map((device) => (
                <li key={device.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <div className="min-w-0">
                    <Link to={`/devices/${device.id}`} className="font-medium text-teal-800 hover:underline">
                      {device.name}
                    </Link>
                    <span className="ml-2 font-mono text-xs text-slate-500">{device.serialNumber}</span>
                    {device.demo && <span className="ml-2"><DemoBadge /></span>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <SignalBars status={device.connectivityStatus} />
                    <span>{formatRelative(device.lastHeartbeatAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
