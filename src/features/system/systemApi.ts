import { apiClient } from '../../lib/api-client';
import type { SystemHealth } from '../../types/api';

export async function fetchSystemHealth(): Promise<SystemHealth> {
  // Backend trả 503 kèm body khi database lỗi: vẫn muốn đọc body đó.
  const response = await apiClient.get<SystemHealth>('/api/v1/system/health', {
    validateStatus: (status) => status === 200 || status === 503,
  });
  return response.data;
}
