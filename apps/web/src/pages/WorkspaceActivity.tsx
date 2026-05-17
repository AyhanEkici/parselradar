import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import WorkspaceActivityFeed from '../components/workspace/WorkspaceActivityFeed';
import SharedAnalysisCard from '../components/workspace/SharedAnalysisCard';

export default function WorkspaceActivity() {
  const { organizationId } = useParams();
  const [activityData, setActivityData] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!organizationId) return;
    Promise.all([
      apiFetch(`workspace/${organizationId}/activity`),
      apiFetch(`workspace/${organizationId}/shared-analysis`),
    ])
      .then(([activity, analyses]) => {
        setActivityData(activity);
        setAnalysisData(analyses);
      })
      .catch((err) => setError(err?.error || 'Workspace activity yüklenemedi'));
  }, [organizationId]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!activityData || !analysisData) return <div className="p-6">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Workspace Activity</h1>
        <WorkspaceActivityFeed items={activityData.items || []} />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Shared Analyses</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(analysisData.rows || []).length === 0 ? (
              <div className="text-sm text-slate-600">No shared analyses yet.</div>
            ) : (
              (analysisData.rows || []).map((row: any) => <SharedAnalysisCard key={row._id} row={row} />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
