import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../lib/auth';
import { useToast } from '../components/ui';
import PasswordResetStatus from '../components/auth/PasswordResetStatus';

const GENERIC_MESSAGE = 'Als dit e-mailadres bij ons bekend is, ontvang je een resetlink.';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    setMessage('');

    try {
      await forgotPassword(email.trim());
      setState('success');
      setMessage(GENERIC_MESSAGE);
      toast.success(GENERIC_MESSAGE);
    } catch {
      setState('success');
      setMessage(GENERIC_MESSAGE);
      toast.success(GENERIC_MESSAGE);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-12 text-slate-100">
      <div className="mx-auto flex max-w-md flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Account recovery</p>
          <h1 className="mt-2 text-3xl font-semibold">Wachtwoord resetten</h1>
          <p className="mt-2 text-sm text-slate-300">Geef je e-mailadres op. We tonen altijd hetzelfde antwoord.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400"
            placeholder="E-mailadres"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            type="email"
          />

          <button
            className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={state === 'loading'}
          >
            {state === 'loading' ? 'Verzenden...' : 'Resetlink sturen'}
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
