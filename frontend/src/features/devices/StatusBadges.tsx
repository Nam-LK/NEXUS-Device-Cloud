import { Badge } from '../../components/ui/Badge';
import { humanize } from '../../lib/formatters';
import type { AdminStatus, ProvisioningStatus } from '../../types/api';

export function AdminStatusBadge({ status }: { status: AdminStatus }) {
  return <Badge tone={status === 'ENABLED' ? 'good' : 'neutral'}>{humanize(status)}</Badge>;
}

export function ProvisioningBadge({ status }: { status: ProvisioningStatus }) {
  const tone = status === 'PROVISIONED' ? 'good' : status === 'DECOMMISSIONED' ? 'bad' : 'info';
  return <Badge tone={tone}>{humanize(status)}</Badge>;
}

export function DemoBadge() {
  return <Badge tone="warn">Demo data</Badge>;
}
