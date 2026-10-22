import { useState, type FormEvent } from 'react';
import { Field, inputClass } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { toApiError, type FieldError } from '../../lib/errors';
import { humanize } from '../../lib/formatters';
import { DEVICE_TYPES, type CreateDeviceInput, type Device, type DeviceType, type Site } from '../../types/api';
import { createDevice } from './devicesApi';

interface DeviceFormDialogProps {
  sites: Site[];
  onClose: () => void;
  onCreated: (device: Device) => void;
}

function errorFor(errors: FieldError[], field: string): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}

export function DeviceFormDialog({ sites, onClose, onCreated }: DeviceFormDialogProps) {
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceType>('ROUTER');
  const [siteId, setSiteId] = useState('');
  const [firmwareVersion, setFirmwareVersion] = useState('');
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): FieldError[] {
    const found: FieldError[] = [];
    if (!name.trim()) found.push({ field: 'name', message: 'Name is required.' });
    if (!serialNumber.trim()) found.push({ field: 'serialNumber', message: 'Serial number is required.' });
    else if (!/^[A-Za-z0-9._-]+$/.test(serialNumber.trim()))
      found.push({ field: 'serialNumber', message: "Use only letters, digits, '.', '_' and '-'." });
    if (!manufacturer.trim()) found.push({ field: 'manufacturer', message: 'Manufacturer is required.' });
    if (!model.trim()) found.push({ field: 'model', message: 'Model is required.' });
    return found;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const clientErrors = validate();
    setErrors(clientErrors);
    if (clientErrors.length > 0) return;

    const input: CreateDeviceInput = {
      name: name.trim(),
      serialNumber: serialNumber.trim(),
      manufacturer: manufacturer.trim(),
      model: model.trim(),
      deviceType,
      siteId: siteId || undefined,
      firmwareVersion: firmwareVersion.trim() || undefined,
    };
    setSubmitting(true);
    try {
      onCreated(await createDevice(input));
    } catch (cause: unknown) {
      const apiError = toApiError(cause);
      setErrors(apiError.fieldErrors);
      setFormError(apiError.fieldErrors.length === 0 ? apiError.message : null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Register device" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Name" error={errorFor(errors, 'name')}>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
        </Field>
        <Field label="Serial number" error={errorFor(errors, 'serialNumber')} hint="Unique within your organization. Stored in upper case.">
          <input className={inputClass} value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} maxLength={64} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Manufacturer" error={errorFor(errors, 'manufacturer')}>
            <input className={inputClass} value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} maxLength={80} />
          </Field>
          <Field label="Model" error={errorFor(errors, 'model')}>
            <input className={inputClass} value={model} onChange={(e) => setModel(e.target.value)} maxLength={80} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Device type" error={errorFor(errors, 'deviceType')}>
            <select className={inputClass} value={deviceType} onChange={(e) => setDeviceType(e.target.value as DeviceType)}>
              {DEVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {humanize(type)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Site (optional)" error={errorFor(errors, 'siteId')}>
            <select className={inputClass} value={siteId} onChange={(e) => setSiteId(e.target.value)}>
              <option value="">Unassigned</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Firmware version (optional)" error={errorFor(errors, 'firmwareVersion')}>
          <input className={inputClass} value={firmwareVersion} onChange={(e) => setFirmwareVersion(e.target.value)} maxLength={40} />
        </Field>

        {formError && (
          <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {formError}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
            {submitting ? 'Registering…' : 'Register device'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
