import { apiClient } from '../../lib/api-client';
import type {
  CreateDeviceInput,
  Device,
  DeviceSearchParams,
  PageResponse,
  Site,
  UpdateDeviceInput,
} from '../../types/api';

export async function searchDevices(params: DeviceSearchParams): Promise<PageResponse<Device>> {
  const response = await apiClient.get<PageResponse<Device>>('/api/v1/devices', { params });
  return response.data;
}

export async function getDevice(deviceId: string): Promise<Device> {
  const response = await apiClient.get<Device>(`/api/v1/devices/${deviceId}`);
  return response.data;
}

export async function createDevice(input: CreateDeviceInput): Promise<Device> {
  const response = await apiClient.post<Device>('/api/v1/devices', input);
  return response.data;
}

export async function updateDevice(deviceId: string, input: UpdateDeviceInput): Promise<Device> {
  const response = await apiClient.patch<Device>(`/api/v1/devices/${deviceId}`, input);
  return response.data;
}

export async function activateDevice(deviceId: string): Promise<Device> {
  const response = await apiClient.post<Device>(`/api/v1/devices/${deviceId}/activation`);
  return response.data;
}

export async function deactivateDevice(deviceId: string): Promise<Device> {
  const response = await apiClient.post<Device>(`/api/v1/devices/${deviceId}/deactivation`);
  return response.data;
}

export async function listSites(): Promise<Site[]> {
  const response = await apiClient.get<Site[]>('/api/v1/sites');
  return response.data;
}
