import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import GovernanceBadge from '../components/governance/GovernanceBadge';

interface Report {
  _id: string;
  governanceClassification?: string;
  trustScore?: number;
  disclosureMode?: string;
  regionalOutlook?: string;
  developmentProbability?: string;
  ingestionComplianceState?: string;
  noFakeActiveProof?: boolean;
  monitoringState?: string;
  opportunityLevel?: string;
  autonomyState?: string;
  reviewQueueDepth?: number;
  suppressionActiveRules?: number;
  cadenceMinutes?: number;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  useEffect(() => {
    apiFetch('reports').then(setReports);
  }, []);
  return (
    <div className="max-w-lg mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Raporlarım</h2>
      <ul className="space-y-2">
        {reports.map(r => (
          <li key={r._id} className="border-b pb-3">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <span>Rapor: {r._id}</span>
              <a className="bg-blue-600 text-white px-3 py-1 rounded" href={`/reports/${r._id}/download`}>İndir</a>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <GovernanceBadge classification={r.governanceClassification} />
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Trust: {r.trustScore ?? '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Disclosure: {r.disclosureMode || '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Outlook: {r.regionalOutlook || '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Dev Prob: {r.developmentProbability || '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Ingestion: {r.ingestionComplianceState || '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">No fake ACTIVE: {r.noFakeActiveProof ? 'PASS' : 'FAIL'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Monitoring: {r.monitoringState || '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Opportunity: {r.opportunityLevel || '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Autonomy: {r.autonomyState || '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Review Queue: {r.reviewQueueDepth ?? '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Suppression: {r.suppressionActiveRules ?? '-'}</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Cadence: {r.cadenceMinutes ?? '-'}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
