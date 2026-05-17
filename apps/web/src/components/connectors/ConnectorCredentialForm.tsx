import React, { useState } from 'react';

interface ConnectorCredentialFormProps {
  connectorKey: string;
  requiredEnv: string[];
  maskedKeys?: Record<string, boolean>;
  onSaved: () => void;
  onError: (msg: string) => void;
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
}

/**
 * Allows admin to mark which credential env vars are present.
 * Values are NEVER entered — only presence is recorded.
 */
export default function ConnectorCredentialForm({
  connectorKey,
  requiredEnv,
  maskedKeys,
  onSaved,
  onError,
  apiFetch,
}: ConnectorCredentialFormProps) {
  const [presentKeys, setPresentKeys] = useState<string[]>(() =>
    requiredEnv.filter((k) => maskedKeys?.[k] === true),
  );
  const [saving, setSaving] = useState(false);

  const toggle = (key: string) => {
    setPresentKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch(`/admin/connectors/${connectorKey}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presentKeys }),
      });
      onSaved();
    } catch (err: any) {
      onError(err?.error || err?.message || 'Failed to save credential profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-slate-800">Credential Presence Profile</div>
      <p className="mb-3 text-xs text-slate-500">
        Mark which environment variables are configured on the server. Values are never stored here.
      </p>
      <div className="space-y-2">
        {requiredEnv.map((key) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={presentKeys.includes(key)}
              onChange={() => toggle(key)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="font-mono text-xs text-slate-700">{key}</span>
            {maskedKeys?.[key] === true && (
              <span className="text-xs text-emerald-600 font-medium">was present</span>
            )}
          </label>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="mt-4 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Credential Profile'}
      </button>
    </div>
  );
}
