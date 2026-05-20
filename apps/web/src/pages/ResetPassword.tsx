import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../lib/auth';
import { useToast } from '../components/ui';
import PasswordResetStatus from '../components/auth/PasswordResetStatus';

const SUCCESS_MESSAGE = 'Je wachtwoord is opnieuw ingesteld. Je kunt nu inloggen.';
const FAILURE_MESSAGE = 'Wachtwoord opnieuw instellen mislukt.';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setState('error');
      setMessage(FAILURE_MESSAGE);
      toast.error(FAILURE_MESSAGE);
      return;
    }

    if (password !== confirmPassword) {
      setState('error');
      setMessage('De wachtwoorden komen niet overeen.');
      toast.error('De wachtwoorden komen niet overeen.');
      return;
    }

    setState('loading');
    setMessage('');

    try {
      await resetPassword(token, password);
      setState('success');
      setMessage(SUCCESS_MESSAGE);
      toast.success(SUCCESS_MESSAGE);
    } catch {
      setState('error');
      setMessage(FAILURE_MESSAGE);
      toast.error(FAILURE_MESSAGE);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-12 text-slate-100">
      <div className="mx-auto flex max-w-md flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Account recovery</p>
          <h1 className="mt-2 text-3xl font-semibold">Nieuw wachtwoord</h1>
          <p className="mt-2 text-sm text-slate-300">Kies een sterk wachtwoord om je account te herstellen.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Nieuw wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            type="password"
          />

          <input
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="Herhaal wachtwoord"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            type="password"
          />

          <button
            className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={state === 'loading'}
          >
            {state === 'loading' ? 'Opslaan...' : 'Wachtwoord opslaan'}
          </button>
        </form>

        <PasswordResetStatus variant={state} message={message} />

        <div className="text-sm text-slate-300">
          <Link to="/login" className="text-cyan-300 hover:underline">
            Terug naar login
          </Link>
        </div>
      </div>
    </div>
  );
}
