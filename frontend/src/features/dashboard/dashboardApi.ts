import { apiClient } from '../../lib/api-client';
import type { DashboardSummary } from '../../types/api';

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get<DashboardSummary>('/api/v1/dashboard/summary');
  return response.data;
}
