import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import axios from 'axios';
import { UNAUTHORIZED_EVENT } from '../../lib/api-client';
import { toApiError, type ApiError } from '../../lib/errors';
import { DEVICE_WRITE_ROLES, type CurrentUser } from '../../types/api';
import * as authApi from './authApi';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'error';

interface AuthContextValue {
  status: AuthStatus;
  user: CurrentUser | null;
  error: ApiError | null;
  /** Chỉ để ẩn/hiện nút. Quyền thật được backend kiểm tra ở mỗi request. */
  canWriteDevices: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  retry: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    authApi
      .fetchCurrentUser()
      .then((current) => {
        if (cancelled) return;
        setUser(current);
        setStatus('authenticated');
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        if (axios.isAxiosError(cause) && cause.response?.status === 401) {
          setUser(null);
          setStatus('anonymous');
        } else {
          setError(toApiError(cause));
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // Phiên hết hạn giữa chừng: đưa người dùng về màn hình đăng nhập.
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      setStatus('anonymous');
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const current = await authApi.login(email, password);
    setUser(current);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      error,
      canWriteDevices: user !== null && DEVICE_WRITE_ROLES.includes(user.role),
      signIn,
      signOut,
      retry,
    }),
    [status, user, error, signIn, signOut, retry],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
