import React, { useState } from 'react';

interface ConnectorSourceApprovalPanelProps {
  connectorKey: string;
  legalRequirement: string;
  legalApproved: boolean;
  approvalNote?: string | null;
  onDone: () => void;
  onError: (msg: string) => void;
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
}

export default function ConnectorSourceApprovalPanel({
  connectorKey,
  legalRequirement,
  legalApproved,
  approvalNote,
  onDone,
  onError,
  apiFetch,
}: ConnectorSourceApprovalPanelProps) {
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState(approvalNote || '');

  const updateApproval = async (approved: boolean) => {
    setSaving(true);
    try {
      await apiFetch(`/admin/connectors/${connectorKey}/source-approval`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved, note }),
      });
      onDone();
    } catch (err: any) {
      onError(err?.error || err?.message || 'Source approval update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 text-sm font-semibold text-slate-800">Legal / Source Approval</div>
      <p className="mb-2 text-xs text-slate-500">
        Requirement key: <span className="font-mono">{legalRequirement}</span>
      </p>
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            legalApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {legalApproved ? 'Approved' : 'Pending Approval'}
        </span>
      </div>
      <div className="mb-3">
        <label className="block text-xs text-slate-600 mb-1">Approval note (optional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          P2_1C_TRIAGED_BACKLOG="Add a note, e.g. 'Signed agreement 2026-05-18'"
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => updateApproval(true)}
          disabled={saving}
          className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? '...' : 'Grant Approval'}
        </button>
        <button
          onClick={() => updateApproval(false)}
          disabled={saving || !legalApproved}
          className="rounded-md bg-slate-400 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-500 disabled:opacity-40"
        >
          Revoke
        </button>
      </div>
    </div>
  );
}
