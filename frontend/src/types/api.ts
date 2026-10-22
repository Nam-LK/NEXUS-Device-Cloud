// Kiểu dữ liệu khớp với hợp đồng API của backend (/api/v1).

export type Role = 'PLATFORM_ADMIN' | 'ORG_ADMIN' | 'NETWORK_OPERATOR' | 'SECURITY_AUDITOR' | 'VIEWER';

/** Các vai trò backend cho phép ghi dữ liệu thiết bị. Chỉ dùng để ẩn/hiện nút; backend vẫn kiểm tra quyền thật. */
export const DEVICE_WRITE_ROLES: readonly Role[] = ['PLATFORM_ADMIN', 'ORG_ADMIN', 'NETWORK_OPERATOR'];

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  organizationId: string;
  organizationName: string;
}

export type DeviceType = 'ROUTER' | 'SWITCH' | 'ACCESS_POINT' | 'FIREWALL' | 'OTHER';
export type ProvisioningStatus = 'REGISTERED' | 'PROVISIONED' | 'DECOMMISSIONED';
export type AdminStatus = 'ENABLED' | 'DISABLED';
export type ConnectivityStatus = 'UNKNOWN' | 'ONLINE' | 'OFFLINE' | 'DEGRADED';

export const DEVICE_TYPES: readonly DeviceType[] = ['ROUTER', 'SWITCH', 'ACCESS_POINT', 'FIREWALL', 'OTHER'];
export const CONNECTIVITY_STATUSES: readonly ConnectivityStatus[] = ['ONLINE', 'DEGRADED', 'OFFLINE', 'UNKNOWN'];
export const ADMIN_STATUSES: readonly AdminStatus[] = ['ENABLED', 'DISABLED'];

export interface Device {
  id: string;
  siteId: string | null;
  siteName: string | null;
  serialNumber: string;
  name: string;
  manufacturer: string;
  model: string;
  deviceType: DeviceType;
  firmwareVersion: string | null;
  provisioningStatus: ProvisioningStatus;
  adminStatus: AdminStatus;
  connectivityStatus: ConnectivityStatus;
  lastHeartbeatAt: string | null;
  demo: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Site {
  id: string;
  name: string;
  city: string | null;
  timezone: string;
}

export interface DashboardSummary {
  totalDevices: number;
  demoDevices: number;
  siteCount: number;
  connectivity: Record<ConnectivityStatus, number>;
  adminStatus: Record<AdminStatus, number>;
  includesDemoData: boolean;
  generatedAt: string;
}

export interface SystemHealth {
  status: 'UP' | 'DEGRADED';
  database: 'UP' | 'DOWN';
  timestamp: string;
}

export interface DeviceSearchParams {
  q?: string;
  siteId?: string;
  connectivity?: ConnectivityStatus;
  adminStatus?: AdminStatus;
  page?: number;
  size?: number;
  sortBy?: 'name' | 'serialNumber' | 'createdAt' | 'connectivityStatus' | 'lastHeartbeatAt';
  direction?: 'asc' | 'desc';
}

export interface CreateDeviceInput {
  name: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  deviceType: DeviceType;
  siteId?: string;
  firmwareVersion?: string;
}

export interface UpdateDeviceInput {
  version: number;
  name?: string;
  siteId?: string;
}
