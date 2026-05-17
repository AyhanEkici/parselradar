import React, { useState } from 'react';

interface ConnectorTestRunPanelProps {
  connectorKey: string;
  lastTestRun?: {
    state: string;
    message: string;
    checkedAt: string | Date;
    samplePayloadSchema?: Record<string, unknown>;
  } | null;
  onTestDone: () => void;
  onError: (msg: string) => void;
  apiFetch: (path: string, opts?: RequestInit) => Promise<any>;
}

export default function ConnectorTestRunPanel({
  connectorKey,
  lastTestRun,
  onTestDone,
  onError,
  apiFetch,
}: ConnectorTestRunPanelProps) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await apiFetch(`/admin/connectors/${connectorKey}/test`, { method: 'POST' });
      setResult(res);
      onTestDone();
    } catch (err: any) {
      onError(err?.error || err?.message || 'Test run failed');
    } finally {
      setRunning(false);
    }
  };

  const display = result || lastTestRun;
  const isPassed = display?.state === 'TEST_PASSED';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-800">Connector Test Run</div>
        <button
          onClick={runTest}
          disabled={running}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {running ? 'Running...' : 'Run Test'}
        </button>
      </div>

      {display ? (
        <div>
          <div
            className={`mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
              isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {display.state}
          </div>
          <p className="mb-1 text-xs text-slate-700">{display.message}</p>
          {display.checkedAt && (
            <p className="text-xs text-slate-400">
              Checked: {new Date(display.checkedAt).toLocaleString()}
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400">No test run recorded yet.</p>
      )}
    </div>
  );
}
