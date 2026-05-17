import React from 'react';

interface ConnectorSamplePayloadPanelProps {
  samplePayloadSchema?: Record<string, unknown> | null;
}

/**
 * Displays the shape of a sample payload schema from a test run.
 * Never displays actual data — only the schema (field names and expected types).
 */
export default function ConnectorSamplePayloadPanel({
  samplePayloadSchema,
}: ConnectorSamplePayloadPanelProps) {
  if (!samplePayloadSchema || Object.keys(samplePayloadSchema).length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-800 mb-2">Sample Payload Schema</div>
        <p className="text-xs text-slate-400">No sample schema available. Run a test to generate one.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-800 mb-1">Sample Payload Schema</div>
      <p className="text-xs text-slate-500 mb-3">
        Expected shape of connector response. No live data is shown here.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-1 text-left font-medium text-slate-600">Field</th>
              <th className="pb-1 text-left font-medium text-slate-600">Expected Type</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(samplePayloadSchema).map(([field, type]) => (
              <tr key={field} className="border-b border-slate-50">
                <td className="py-1 font-mono text-slate-800">{field}</td>
                <td className="py-1 text-slate-500">{String(type)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
