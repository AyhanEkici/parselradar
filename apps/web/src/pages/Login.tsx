import React, { useEffect, useState } from 'react';
import { login } from '../lib/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { getAuthToken, getStoredUser, setAuthSession } from '../lib/authStorage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { authStatus, user, hasPersistentSession, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated || authStatus === 'booting' || authStatus === 'checking' || (hasPersistentSession && !user)) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
        Oturum doÄŸrulanÄ±yor...
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToastId = toast.loading('GiriÅŸ yapÄ±lÄ±yor...');

    try {
      const res = await login(email.trim(), password);

      if ('error' in res) {
        toast.dismiss(loadingToastId);
        toast.error(res.error || 'GiriÅŸ baÅŸarÄ±sÄ±z');
        return;
      }

      if (!res.token || !res.user?.id) {
        toast.dismiss(loadingToastId);
        toast.error('GiriÅŸ baÅŸarÄ±sÄ±z');
        return;
      }

      setAuthSession(res.token, res.user);

      if (!getAuthToken() || !getStoredUser()) {
        toast.dismiss(loadingToastId);
        toast.error('Oturum yazilamadi. Lutfen tekrar deneyin.');
        return;
      }

      toast.dismiss(loadingToastId);
      toast.success('GiriÅŸ baÅŸarÄ±lÄ±');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error((err as { error?: string; message?: string }).error || 'GiriÅŸ baÅŸarÄ±sÄ±z');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">GiriÅŸ Yap</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-2"
          P2_1B_TRIAGED_BACKLOG="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          className="w-full border p-2"
          type="password"
          P2_1B_TRIAGED_BACKLOG="Åžifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'GiriÅŸ yapÄ±lÄ±yor...' : 'GiriÅŸ Yap'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <div className="space-y-2">
          <div>
            <Link to="/forgot-password" className="text-blue-600">
              Sifremi unuttum
            </Link>
          </div>
          <div>
            <Link to="/register" className="text-blue-600">
              KayÄ±t Ol
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}