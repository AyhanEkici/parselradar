import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import {
  AdminEmptyState,
  AdminHeader,
  AdminLayout,
  AdminPage,
  AdminStatusPill,
  AdminSurface,
} from '../components/admin';
import { useAuth } from '../hooks/useAuth';

type AdminUser = {
  _id: string;
  email?: string;
  name?: string;
};

type AdminProperty = {
  _id: string;
  addressText?: string;
  il?: string;
  ilce?: string;
  status?: string;
  userId?: string | { _id?: string; email?: string; name?: string };
  dealFlowConsentStatus?: 'NOT_ASKED' | 'DECLINED' | 'OPTED_IN';
  professionalContactAllowed?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type AnalysisSummaryItem = {
  _id?: string;
  productType?: string;
  signal?: string;
  score?: number;
  createdAt?: string;
};

type PropertyDetailEnvelope = {
  documents?: Array<{ _id: string }>;
  analysisSummary?: {
    quickScore?: AnalysisSummaryItem | null;
    parcelInsight?: AnalysisSummaryItem | null;
    developerFit?: AnalysisSummaryItem | null;
  };
  latestAnalysis?: AnalysisSummaryItem | null;
};

type AdminAnalysis = {
  _id: string;
  propertySubmissionId?: {
    _id?: string;
  } | null;
  productType?: string;
  createdAt?: string;
};

type RegistryRow = {
  propertyId: string;
  title: string;
  location: string;
  userDisplay: string;
  propertyStatus: string;
  evidenceCountText: string;
  evidenceStatusText: string;
  analysisRunStatusText: string;
  reportReadinessText: string;
  dealFlowConsentText: string;
  professionalContactText: string;
  betaIssueStatusText: string;
  lastUpdatedText: string;
};

function consentStatusLabel(status?: 'NOT_ASKED' | 'DECLINED' | 'OPTED_IN') {
  if (status === 'OPTED_IN') return 'Opted in';
  if (status === 'DECLINED') return 'Declined';
  return 'Not asked';
}

function toUserId(userId: AdminProperty['userId']): string {
  if (!userId) return '';
  if (typeof userId === 'string') return userId;
  return String(userId._id || '');
}

function formatDate(value?: string) {
  if (!value) return 'Not available from current endpoint';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not available from current endpoint';
  return parsed.toLocaleString('tr-TR');
}

function toneForStatus(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'APPROVED' || normalized === 'READY') return 'success';
  if (normalized === 'REJECTED') return 'danger';
  if (normalized === 'PENDING' || normalized === 'DRAFT') return 'warning';
  if (normalized) return 'info';
  return 'neutral';
}

function buildAnalysisRunStatus(detail: PropertyDetailEnvelope | null, analysisRuns: number) {
  if (!detail) return 'Not available from current endpoint';
  const quick = Boolean(detail.analysisSummary?.quickScore);
  const parcel = Boolean(detail.analysisSummary?.parcelInsight);
  const developer = Boolean(detail.analysisSummary?.developerFit);
  const runs = [quick, parcel, developer].filter(Boolean).length;
  if (runs > 0) {
    return `${runs}/3 product analyses available`;
  }
  if (analysisRuns > 0) {
    return `${analysisRuns} run(s) available via /admin/analyses`;
  }
  return 'No analysis run found';
}

export default function AdminAnalysisReports() {
  const { user, isAdmin, authStatus, hasPersistentSession } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<RegistryRow[]>([]);

  if (authStatus === 'booting' || authStatus === 'checking' || (hasPersistentSession && !user)) {
    return <div className="premium-admin premium-surface max-w-md mx-auto mt-20 p-6 rounded shadow">Oturum doğrulanıyor...</div>;
  }

  if (!user || authStatus === 'unauthenticated' || authStatus === 'invalid') {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [propertiesRaw, usersRaw, analysesRaw] = await Promise.all([
          apiFetch('/admin/properties'),
          apiFetch('/admin/users?page=1&limit=100'),
          apiFetch('/admin/analyses?page=1&limit=100'),
        ]);

        const properties = (Array.isArray(propertiesRaw) ? propertiesRaw : []) as AdminProperty[];
        const users = (Array.isArray((usersRaw as { users?: unknown[] })?.users)
          ? (usersRaw as { users: AdminUser[] }).users
          : []) as AdminUser[];
        const analyses = (Array.isArray((analysesRaw as { analyses?: unknown[] })?.analyses)
          ? (analysesRaw as { analyses: AdminAnalysis[] }).analyses
          : []) as AdminAnalysis[];

        const userMap = new Map<string, AdminUser>();
        users.forEach((u) => userMap.set(String(u._id), u));

        const analysesByProperty = new Map<string, AdminAnalysis[]>();
        analyses.forEach((run) => {
          const propertyId = String(run.propertySubmissionId?._id || '');
          if (!propertyId) return;
          const existing = analysesByProperty.get(propertyId) || [];
          existing.push(run);
          analysesByProperty.set(propertyId, existing);
        });

        const details = await Promise.all(
          properties.map(async (property) => {
            try {
              const detail = (await apiFetch(`/admin/properties/${property._id}`)) as PropertyDetailEnvelope;
              return { propertyId: property._id, detail };
            } catch {
              return { propertyId: property._id, detail: null };
            }
          })
        );

        const detailMap = new Map<string, PropertyDetailEnvelope | null>();
        details.forEach((entry) => detailMap.set(entry.propertyId, entry.detail));

        const mapped: RegistryRow[] = properties.map((property) => {
          const propertyId = String(property._id);
          const detail = detailMap.get(propertyId) || null;
          const propertyRuns = analysesByProperty.get(propertyId) || [];
          const uid = toUserId(property.userId);
          const mappedUser = uid ? userMap.get(uid) : null;
          const embeddedUser = typeof property.userId === 'object' ? property.userId : null;
          const userDisplay = mappedUser
            ? `${mappedUser.name || mappedUser.email || mappedUser._id}${mappedUser.email && mappedUser.name ? ` (${mappedUser.email})` : ''}`
            : embeddedUser?.email || embeddedUser?.name || (uid || 'Not available from current endpoint');

          const title = property.addressText || 'Not available from current endpoint';
          const location = [property.il, property.ilce].filter(Boolean).join(' / ') || 'Not available from current endpoint';
          const evidenceCount = Array.isArray(detail?.documents) ? detail.documents.length : null;
          const evidenceCountText =
            evidenceCount === null ? 'Not available from current endpoint' : `${evidenceCount} document(s)`;
          const evidenceStatusText =
            evidenceCount === null
              ? 'Not available from current endpoint'
              : evidenceCount > 0
              ? 'Supporting evidence uploaded'
              : 'No evidence uploaded';

          const analysisRunStatusText = buildAnalysisRunStatus(detail, propertyRuns.length);

          const reportReadinessText =
            evidenceCount === null
              ? 'Not available from current endpoint'
              : evidenceCount === 0
              ? 'Needs evidence (0 uploaded)'
              : propertyRuns.length > 0
              ? 'Partial readiness (evidence + analysis runs)'
              : 'Evidence uploaded; analysis-run readiness pending';

          return {
            propertyId,
            title,
            location,
            userDisplay,
            propertyStatus: String(property.status || 'UNKNOWN'),
            evidenceCountText,
            evidenceStatusText,
            analysisRunStatusText,
            reportReadinessText,
            dealFlowConsentText: consentStatusLabel(property.dealFlowConsentStatus),
            professionalContactText: property.professionalContactAllowed ? 'Allowed' : 'Not allowed',
            betaIssueStatusText: 'Not available from current endpoint',
            lastUpdatedText: formatDate(property.updatedAt || property.createdAt || detail?.latestAnalysis?.createdAt),
          };
        });

        if (!cancelled) {
          setRows(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          const e = err as { error?: string; message?: string };
          setError(e.error || e.message || 'Analysis report registry could not be loaded');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => a.title.localeCompare(b.title, 'tr'));
  }, [rows]);

  return (
    <AdminLayout title="Analysis Reports">
      <AdminPage className="premium-admin p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader
            title="Analysis Reports"
            subtitle="Central review of beta tester properties, evidence visibility and analysis/report surface state."
            actions={
              <div className="flex flex-wrap gap-2 text-sm">
                <Link to="/admin/cms" className="rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50">
                  Back to CMS
                </Link>
                <Link to="/admin/deal-flow" className="rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50">
                  Professional Deal-Flow
                </Link>
                <Link to="/admin/properties" className="rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50">
                  Open Properties
                </Link>
              </div>
            }
          />

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Controlled beta review surface. Uploaded evidence and readiness outputs are informational only and are not official legal, tapu, cadastral or zoning proof.
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            Analysis run registry source: <span className="font-semibold">/admin/analyses</span>. Report-readiness registry: <span className="font-semibold">partial / analysis-run endpoint not wired yet for explicit report-readiness state</span>.
            <div className="mt-1">Map/layer registry status is informational only. TKGM, TUCBS and CSB/imar layers are not connected in this phase.</div>
            <div className="mt-1">Coordinate preview may be available from uploaded CSV metadata; official map/layer integrations are not connected.</div>
            <div className="mt-1">Missing-evidence source guidance is manual-only: TKGM Parsel Sorgu and municipality e-Imar/e-Plan/Imar Durumu directions are informational support, not automated external access or official verification.</div>
            <div className="mt-1">Municipality source registry policy: verified/manual-only entries. No fake municipality URLs, no scraping, no auto-search, and no automated official verification claims.</div>
          </div>

          {error ? <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
          {loading ? <div className="text-sm text-slate-500">Loading analysis report registry...</div> : null}

          {!loading && sortedRows.length === 0 ? (
            <AdminEmptyState>No beta tester property found from current admin endpoints.</AdminEmptyState>
          ) : null}

          {!loading && sortedRows.length > 0 ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:hidden">
                {sortedRows.map((row) => (
                  <article key={`${row.propertyId}-mobile`} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="font-semibold text-slate-900 break-words">{row.title}</div>
                    <div className="mt-1 text-xs text-slate-600">{row.location}</div>
                    <div className="mt-1 text-[11px] font-mono text-slate-500">{row.propertyId}</div>

                    <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-700">
                      <div><span className="font-medium">User:</span> {row.userDisplay}</div>
                      <div><span className="font-medium">Evidence:</span> {row.evidenceCountText}</div>
                      <div><span className="font-medium">Analysis:</span> {row.analysisRunStatusText}</div>
                      <div><span className="font-medium">Readiness:</span> {row.reportReadinessText}</div>
                      <div><span className="font-medium">Consent:</span> {row.dealFlowConsentText}</div>
                      <div><span className="font-medium">Contact:</span> {row.professionalContactText}</div>
                      <div><span className="font-medium">Updated:</span> {row.lastUpdatedText}</div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <AdminStatusPill tone={toneForStatus(row.propertyStatus)}>{row.propertyStatus}</AdminStatusPill>
                      <Link
                        to={`/admin/properties/${row.propertyId}`}
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        Open Property
                      </Link>
                      <Link
                        to={`/admin/properties/${row.propertyId}/documents`}
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        Evidence/Documents
                      </Link>
                      <Link
                        to={`/properties/${row.propertyId}/result`}
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        Open report-ready result
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-auto rounded-lg border border-slate-200 md:block">
              <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-3 py-2">User / Email</th>
                    <th className="px-3 py-2">Property</th>
                    <th className="px-3 py-2">Property ID</th>
                    <th className="px-3 py-2">Evidence</th>
                    <th className="px-3 py-2">Analysis Runs</th>
                    <th className="px-3 py-2">Report Readiness</th>
                    <th className="px-3 py-2">Deal-flow Consent</th>
                    <th className="px-3 py-2">Professional Contact</th>
                    <th className="px-3 py-2">Beta Issue/Test Status</th>
                    <th className="px-3 py-2">Last Updated</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sortedRows.map((row) => (
                    <tr key={row.propertyId}>
                      <td className="px-3 py-2 align-top text-slate-700">{row.userDisplay}</td>
                      <td className="px-3 py-2 align-top">
                        <div className="font-medium text-slate-900">{row.title}</div>
                        <div className="text-xs text-slate-600">{row.location}</div>
                        <div className="mt-1">
                          <AdminStatusPill tone={toneForStatus(row.propertyStatus)}>{row.propertyStatus}</AdminStatusPill>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top font-mono text-xs text-slate-700">{row.propertyId}</td>
                      <td className="px-3 py-2 align-top text-slate-700">
                        <div>{row.evidenceCountText}</div>
                        <div className="text-xs text-slate-500">{row.evidenceStatusText}</div>
                      </td>
                      <td className="px-3 py-2 align-top text-slate-700">{row.analysisRunStatusText}</td>
                      <td className="px-3 py-2 align-top text-slate-700">{row.reportReadinessText}</td>
                      <td className="px-3 py-2 align-top text-slate-700">{row.dealFlowConsentText}</td>
                      <td className="px-3 py-2 align-top text-slate-700">{row.professionalContactText}</td>
                      <td className="px-3 py-2 align-top text-slate-700">{row.betaIssueStatusText}</td>
                      <td className="px-3 py-2 align-top text-slate-700">{row.lastUpdatedText}</td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-col gap-1">
                          <Link
                            to={`/admin/properties/${row.propertyId}`}
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            Open Property
                          </Link>
                          <Link
                            to={`/admin/properties/${row.propertyId}/documents`}
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            Evidence/Documents
                          </Link>
                          <Link
                            to={`/properties/${row.propertyId}/result`}
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            Open report-ready result
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          ) : null}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
