import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Field, inputClass } from '../../components/ui/Field';
import { toApiError } from '../../lib/errors';
import { BackendStatus } from '../system/BackendStatus';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const { status, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (status === 'authenticated') return <Navigate to="/" replace />;

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    if (!email.trim() || !password) {
      setMessage('Enter your email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (cause: unknown) {
      const error = toApiError(cause);
      setMessage(error.status === 401 ? 'Email or password is incorrect.' : error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-petrol-900 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h1 className="text-xl font-semibold text-slate-900">NEXUS Device Cloud</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to manage your network devices.</p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
          <Field label="Email">
            <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Password">
            <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          </Field>
          {message && (
            <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <BackendStatus tone="light" />
        </div>
      </div>
    </div>
  );
}
