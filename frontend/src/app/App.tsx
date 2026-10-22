import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { AuthProvider } from '../features/auth/AuthContext';
import { LoginPage } from '../features/auth/LoginPage';
import { RequireAuth } from '../features/auth/RequireAuth';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { DeviceDetailPage } from '../features/devices/DeviceDetailPage';
import { DevicesPage } from '../features/devices/DevicesPage';
import { NotFoundPage } from './NotFoundPage';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="devices" element={<DevicesPage />} />
            <Route path="devices/:deviceId" element={<DeviceDetailPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
