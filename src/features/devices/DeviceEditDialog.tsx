import { useState, type FormEvent } from 'react';
import { Field, inputClass } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { toApiError } from '../../lib/errors';
import type { Device, Site } from '../../types/api';
import { updateDevice } from './devicesApi';

interface DeviceEditDialogProps {
  device: Device;
  sites: Site[];
  onClose: () => void;
  onSaved: (device: Device) => void;
}

export function DeviceEditDialog({ device, sites, onClose, onSaved }: DeviceEditDialogProps) {
  const [name, setName] = useState(device.name);
  const [siteId, setSiteId] = useState(device.siteId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const saved = await updateDevice(device.id, {
        version: device.version,
        name: name.trim(),
        siteId: siteId || undefined,
      });
      onSaved(saved);
    } catch (cause: unknown) {
      const apiError = toApiError(cause);
      setError(
        apiError.status === 409
          ? `${apiError.message} Close this dialog; the page will show the latest data.`
          : apiError.message,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Edit device" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Name">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
        </Field>
        <Field label="Site" hint="A device can be moved to another site, but cannot be left unassigned once assigned.">
          <select className={inputClass} value={siteId} onChange={(e) => setSiteId(e.target.value)}>
            {!device.siteId && <option value="">Unassigned</option>}
            {sites.map((site) => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
        </Field>
        {error && <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={submitting} className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
