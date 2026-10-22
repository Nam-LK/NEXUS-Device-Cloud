import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { SignalBars } from '../../components/ui/SignalBars';
import { inputClass } from '../../components/ui/Field';
import { formatRelative, humanize } from '../../lib/formatters';
import { useAsync } from '../../lib/useAsync';
import {
  ADMIN_STATUSES,
  CONNECTIVITY_STATUSES,
  type AdminStatus,
  type ConnectivityStatus,
  type DeviceSearchParams,
} from '../../types/api';
import { useAuth } from '../auth/AuthContext';
import { DeviceFormDialog } from './DeviceFormDialog';
import { AdminStatusBadge, DemoBadge } from './StatusBadges';
import { listSites, searchDevices } from './devicesApi';

const PAGE_SIZE = 15;

const SORT_OPTIONS: { value: string; label: string; sortBy: NonNullable<DeviceSearchParams['sortBy']>; direction: 'asc' | 'desc' }[] = [
  { value: 'name-asc', label: 'Name (A–Z)', sortBy: 'name', direction: 'asc' },
  { value: 'name-desc', label: 'Name (Z–A)', sortBy: 'name', direction: 'desc' },
  { value: 'createdAt-desc', label: 'Newest first', sortBy: 'createdAt', direction: 'desc' },
  { value: 'lastHeartbeatAt-desc', label: 'Latest heartbeat', sortBy: 'lastHeartbeatAt', direction: 'desc' },
];

export function DevicesPage() {
  const { canWriteDevices } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [siteId, setSiteId] = useState('');
  const [connectivity, setConnectivity] = useState<ConnectivityStatus | ''>('');
  const [adminStatus, setAdminStatus] = useState<AdminStatus | ''>('');
  const [sortValue, setSortValue] = useState(SORT_OPTIONS[0]!.value);
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const sort = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0]!;
  const sites = useAsync(listSites, []);
  const devices = useAsync(
    () =>
      searchDevices({
        q: debouncedSearch.trim() || undefined,
        siteId: siteId || undefined,
        connectivity: connectivity || undefined,
        adminStatus: adminStatus || undefined,
        page,
        size: PAGE_SIZE,
        sortBy: sort.sortBy,
        direction: sort.direction,
      }),
    [debouncedSearch, siteId, connectivity, adminStatus, page, sort.sortBy, sort.direction],
  );

  const hasFilters = Boolean(debouncedSearch.trim() || siteId || connectivity || adminStatus);

  function resetFilters() {
    setSearch('');
    setDebouncedSearch('');
    setSiteId('');
    setConnectivity('');
    setAdminStatus('');
    setPage(0);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Devices</h1>
          <p className="text-sm text-slate-600">Routers, switches, access points and firewalls in your organization.</p>
        </div>
        {canWriteDevices ? (
          <button type="button" onClick={() => setDialogOpen(true)} className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800">
            Register device
          </button>
        ) : (
          <span className="text-xs text-slate-500">Your role is read-only.</span>
        )}
      </div>

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          type="search"
          aria-label="Search devices"
          placeholder="Search name, serial or model"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} lg:col-span-2`}
        />
        <select aria-label="Filter by site" value={siteId} onChange={(e) => { setSiteId(e.target.value); setPage(0); }} className={inputClass}>
          <option value="">All sites</option>
          {(sites.data ?? []).map((site) => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>
        <select aria-label="Filter by connectivity" value={connectivity} onChange={(e) => { setConnectivity(e.target.value as ConnectivityStatus | ''); setPage(0); }} className={inputClass}>
          <option value="">Any connectivity</option>
          {CONNECTIVITY_STATUSES.map((status) => (
            <option key={status} value={status}>{humanize(status)}</option>
          ))}
        </select>
        <select aria-label="Filter by administrative status" value={adminStatus} onChange={(e) => { setAdminStatus(e.target.value as AdminStatus | ''); setPage(0); }} className={inputClass}>
          <option value="">Enabled or disabled</option>
          {ADMIN_STATUSES.map((status) => (
            <option key={status} value={status}>{humanize(status)}</option>
          ))}
        </select>
        <select aria-label="Sort devices" value={sortValue} onChange={(e) => { setSortValue(e.target.value); setPage(0); }} className={`${inputClass} sm:col-span-2 lg:col-span-1`}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {devices.loading && !devices.data && <LoadingState label="Loading devices…" />}
      {devices.error && <ErrorState error={devices.error} title="Could not load devices" onRetry={devices.reload} />}

      {devices.data && devices.data.items.length === 0 && (
        <EmptyState
          title={hasFilters ? 'No devices match these filters' : 'No devices yet'}
          description={hasFilters ? 'Try removing a filter or searching for something else.' : 'Register a device to start managing it.'}
          action={
            hasFilters ? (
              <button type="button" onClick={resetFilters} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                Clear filters
              </button>
            ) : undefined
          }
        />
      )}

      {devices.data && devices.data.items.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">Device</th>
                <th scope="col" className="px-4 py-2 font-medium">Type</th>
                <th scope="col" className="px-4 py-2 font-medium">Site</th>
                <th scope="col" className="px-4 py-2 font-medium">Connectivity</th>
                <th scope="col" className="px-4 py-2 font-medium">Admin</th>
                <th scope="col" className="px-4 py-2 font-medium">Last heartbeat</th>
                <th scope="col" className="px-4 py-2 font-medium">Firmware</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.data.items.map((device) => (
                <tr key={device.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <Link to={`/devices/${device.id}`} className="font-medium text-teal-800 hover:underline">{device.name}</Link>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">{device.serialNumber}</span>
                      {device.demo && <DemoBadge />}
                    </div>
                  </td>
                  <td className="px-4 py-2">{humanize(device.deviceType)}</td>
                  <td className="px-4 py-2">{device.siteName ?? '—'}</td>
                  <td className="px-4 py-2"><SignalBars status={device.connectivityStatus} /></td>
                  <td className="px-4 py-2"><AdminStatusBadge status={device.adminStatus} /></td>
                  <td className="px-4 py-2 text-slate-600">{formatRelative(device.lastHeartbeatAt)}</td>
                  <td className="px-4 py-2 font-mono text-xs">{device.firmwareVersion ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2 text-sm text-slate-600">
            <span>
              Page {devices.data.page + 1} of {Math.max(devices.data.totalPages, 1)} · {devices.data.totalElements} devices
            </span>
            <div className="flex gap-2">
              <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40">
                Previous
              </button>
              <button type="button" disabled={page + 1 >= devices.data.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {dialogOpen && (
        <DeviceFormDialog
          sites={sites.data ?? []}
          onClose={() => setDialogOpen(false)}
          onCreated={(device) => {
            setDialogOpen(false);
            navigate(`/devices/${device.id}`);
          }}
        />
      )}
    </div>
  );
}
