import { apiClient } from '../../lib/api-client';
import type { CurrentUser } from '../../types/api';

export async function login(email: string, password: string): Promise<CurrentUser> {
  const response = await apiClient.post<CurrentUser>('/api/v1/auth/login', { email, password });
  return response.data;
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const response = await apiClient.get<CurrentUser>('/api/v1/auth/me');
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/v1/auth/logout');
}
