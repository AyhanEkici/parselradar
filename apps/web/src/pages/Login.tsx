import React, { useEffect, useState } from 'react';
import { login } from '../lib/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui';
import ForgotPasswordLink from '../components/auth/ForgotPasswordLink';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { authState, user, hydrating } = useAuth();

  useEffect(() => {
    if (!hydrating && authState === 'authenticated' && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [hydrating, authState, user, navigate]);

  if (hydrating || authState === 'authenticated') {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
        Oturum doğrulanıyor...
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToastId = toast.loading('Giriş yapılıyor...');

    try {
      // login() calls setAuthSession internally on success (via auth.ts).
      // Do NOT write to localStorage here — that would create a duplicate.
      const res = await login(email.trim(), password);

      if ('error' in res) {
        toast.dismiss(loadingToastId);
        toast.error(res.error || 'Giriş başarısız');
        return;
      }

      if (!res.token || !res.user?.id) {
        toast.dismiss(loadingToastId);
        toast.error('Giriş başarısız');
        return;
      }

      toast.dismiss(loadingToastId);
      toast.success('Giriş başarılı');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error((err as { error?: string; message?: string }).error || 'Giriş başarısız');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Giriş Yap</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-2"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          className="w-full border p-2"
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <div className="space-y-2">
          <ForgotPasswordLink />
          <div>
            <Link to="/register" className="text-blue-600">
              Kayıt Ol
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}