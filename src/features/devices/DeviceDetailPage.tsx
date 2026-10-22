import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { SignalBars } from '../../components/ui/SignalBars';
import { toApiError } from '../../lib/errors';
import { formatDateTime, formatRelative, humanize } from '../../lib/formatters';
import { useAsync } from '../../lib/useAsync';
import type { Device } from '../../types/api';
import { useAuth } from '../auth/AuthContext';
import { DeviceEditDialog } from './DeviceEditDialog';
import { AdminStatusBadge, DemoBadge, ProvisioningBadge } from './StatusBadges';
import { activateDevice, deactivateDevice, getDevice, listSites } from './devicesApi';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-2 last:border-0">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className="text-sm text-slate-900">{children}</dd>
    </div>
  );
}

export function DeviceDetailPage() {
  const { deviceId = '' } = useParams();
  const { canWriteDevices } = useAuth();
  const device = useAsync(() => getDevice(deviceId), [deviceId]);
  const sites = useAsync(listSites, []);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function runAction(action: () => Promise<Device>, successMessage: string) {
    setBusy(true);
    setActionError(null);
    setNotice(null);
    try {
      await action();
      setNotice(successMessage);
      device.reload();
    } catch (cause: unknown) {
      setActionError(toApiError(cause).message);
    } finally {
      setBusy(false);
    }
  }

  if (device.loading && !device.data) return <LoadingState label="Loading device…" />;
  if (device.error) {
    const notFound = device.error.status === 404;
    return (
      <div className="mx-auto max-w-3xl space-y-3">
        <ErrorState
          error={device.error}
          title={notFound ? 'Device not found' : 'Could not load the device'}
          onRetry={notFound ? undefined : device.reload}
        />
        <Link to="/devices" className="text-sm font-medium text-teal-700 hover:underline">Back to devices</Link>
      </div>
    );
  }
  const data = device.data;
  if (!data) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link to="/devices" className="text-sm font-medium text-teal-700 hover:underline">← All devices</Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-semibold">
            {data.name} {data.demo && <DemoBadge />}
          </h1>
          <p className="font-mono text-sm text-slate-500">{data.serialNumber}</p>
        </div>
        {canWriteDevices ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(true)} disabled={busy} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60">
              Edit
            </button>
            {data.adminStatus === 'ENABLED' ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (window.confirm(`Deactivate ${data.name}? It will be marked as disabled by an operator.`)) {
                    void runAction(() => deactivateDevice(data.id), 'Device deactivated.');
                  }
                }}
                className="rounded-md border border-rose-300 px-3 py-2 text-sm text-rose-800 hover:bg-rose-50 disabled:opacity-60"
              >
                Deactivate
              </button>
            ) : (
              <button
                type="button"
                disabled={busy || data.provisioningStatus === 'DECOMMISSIONED'}
                title={data.provisioningStatus === 'DECOMMISSIONED' ? 'A decommissioned device cannot be activated.' : undefined}
                onClick={() => void runAction(() => activateDevice(data.id), 'Device activated.')}
                className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                Activate
              </button>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-500">Your role is read-only.</span>
        )}
      </div>

      {notice && <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}
      {actionError && <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">{actionError}</p>}
      {data.demo && (
        <p role="note" className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          This is a seeded demo device. Its connectivity status and heartbeat are sample values, not live measurements.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4" aria-labelledby="state-heading">
          <h2 id="state-heading" className="mb-1 text-sm font-semibold">State</h2>
          <dl>
            <Row label="Connectivity"><SignalBars status={data.connectivityStatus} /></Row>
            <Row label="Last heartbeat">{data.lastHeartbeatAt ? `${formatRelative(data.lastHeartbeatAt)} (${formatDateTime(data.lastHeartbeatAt)})` : 'never'}</Row>
            <Row label="Administrative"><AdminStatusBadge status={data.adminStatus} /></Row>
            <Row label="Provisioning"><ProvisioningBadge status={data.provisioningStatus} /></Row>
            <Row label="Firmware"><span className="font-mono">{data.firmwareVersion ?? '—'}</span></Row>
          </dl>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4" aria-labelledby="identity-heading">
          <h2 id="identity-heading" className="mb-1 text-sm font-semibold">Identity</h2>
          <dl>
            <Row label="Type">{humanize(data.deviceType)}</Row>
            <Row label="Manufacturer">{data.manufacturer}</Row>
            <Row label="Model">{data.model}</Row>
            <Row label="Site">{data.siteName ?? 'Unassigned'}</Row>
            <Row label="Registered">{formatDateTime(data.createdAt)}</Row>
            <Row label="Last updated">{formatDateTime(data.updatedAt)}</Row>
          </dl>
        </section>
      </div>

      <p className="text-xs text-slate-500">
        Telemetry charts, command history and configuration history are not part of this release.
      </p>

      {editing && (
        <DeviceEditDialog
          device={data}
          sites={sites.data ?? []}
          onClose={() => {
            setEditing(false);
            device.reload();
          }}
          onSaved={() => {
            setEditing(false);
            setNotice('Changes saved.');
            device.reload();
          }}
        />
      )}
    </div>
  );
}
