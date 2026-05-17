import React, { useState } from 'react';

interface ConnectorActivationControlsProps {
  connectorKey: string;
  currentState: string;
  onDone: () => void;
  onError: (msg: string) => void;
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
}

const ACTIVATABLE_FROM = ['TEST_PASSED', 'DISABLED'];
const DEACTIVATABLE_FROM = ['ACTIVE'];

export default function ConnectorActivationControls({
  connectorKey,
  currentState,
  onDone,
  onError,
  apiFetch,
}: ConnectorActivationControlsProps) {
  const [loading, setLoading] = useState(false);

  const canActivate = ACTIVATABLE_FROM.includes(currentState);
  const canDeactivate = DEACTIVATABLE_FROM.includes(currentState);

  const activate = async () => {
    setLoading(true);
    try {
      await apiFetch(`/admin/connectors/${connectorKey}/activate`, { method: 'POST' });
      onDone();
    } catch (err: any) {
      onError(err?.error || err?.message || 'Activation failed');
    } finally {
      setLoading(false);
    }
  };

  const deactivate = async () => {
    setLoading(true);
    try {
      await apiFetch(`/admin/connectors/${connectorKey}/deactivate`, { method: 'POST' });
      onDone();
    } catch (err: any) {
      onError(err?.error || err?.message || 'Deactivation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-slate-800">Activation Controls</div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs text-slate-600">Current state:</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            currentState === 'ACTIVE'
              ? 'bg-emerald-100 text-emerald-700'
              : currentState === 'DISABLED'
                ? 'bg-slate-200 text-slate-600'
                : currentState === 'TEST_PASSED'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-amber-100 text-amber-700'
          }`}
        >
          {currentState}
        </span>
      </div>
      <p className="mb-3 text-xs text-slate-500">
        Activation requires credentials, legal approval, and a passed test run.
      </p>
      <div className="flex gap-2">
        <button
          onClick={activate}
          disabled={!canActivate || loading}
          title={canActivate ? 'Activate connector' : `Cannot activate from state: ${currentState}`}
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? '...' : 'Activate'}
        </button>
        <button
          onClick={deactivate}
          disabled={!canDeactivate || loading}
          title={canDeactivate ? 'Deactivate connector' : `Cannot deactivate from state: ${currentState}`}
          className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? '...' : 'Deactivate'}
        </button>
      </div>
    </div>
  );
}
