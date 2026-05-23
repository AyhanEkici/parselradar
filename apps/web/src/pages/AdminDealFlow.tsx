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
  userId?: string | { _id?: string; email?: string; name?: string };
  addressText?: string;
  il?: string;
  ilce?: string;
  mahalleOrKoy?: string;
  assetType?: string;
  askingPriceTRY?: number;
  areaM2?: number;
  dealFlowConsentStatus?: 'NOT_ASKED' | 'DECLINED' | 'OPTED_IN';
  dealFlowConsentAt?: string;
  dealFlowConsentScope?: string[];
  professionalContactAllowed?: boolean;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
};

type AdminAnalysis = {
  _id: string;
  propertySubmissionId?: { _id?: string } | null;
};

type PropertyDetailEnvelope = {
  documents?: Array<{
    _id: string;
    documentType?: string;
    originalName?: string;
  }>;
};

type DealFlowRow = {
  propertyId: string;
  propertyTitle: string;
  location: string;
  userDisplay: string;
  assetTypeText: string;
  askingPriceText: string;
  areaText: string;
  consentStatusText: string;
  consentAtText: string;
  contactPermissionText: string;
  evidenceReadinessText: string;
  missingEvidenceText: string;
  marketSignalText: string;
  analysisRunsText: string;
  updatedText: string;
  isOptedIn: boolean;
  contactAllowed: boolean;
  needsEvidence: boolean;
  readyForReview: boolean;
};

type FilterKey = 'ALL' | 'OPTED_IN' | 'CONTACT_ALLOWED' | 'NEEDS_EVIDENCE' | 'READY_FOR_REVIEW';

function formatDate(value?: string) {
  if (!value) return 'Not available from current endpoint';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not available from current endpoint';
  return parsed.toLocaleString('tr-TR');
}

function formatMoney(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(value)} TRY`;
}

function consentStatusLabel(status?: 'NOT_ASKED' | 'DECLINED' | 'OPTED_IN') {
  if (status === 'OPTED_IN') return 'Opted in';
  if (status === 'DECLINED') return 'Declined';
  return 'Not asked';
}

function toUserId(userId: AdminProperty['userId']) {
  if (!userId) return '';
  if (typeof userId === 'string') return userId;
  return String(userId._id || '');
}

function shortenId(value?: string) {
  if (!value) return 'Not available from current endpoint';
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function toneForBoolean(ok: boolean): 'success' | 'warning' | 'neutral' {
  return ok ? 'success' : 'warning';
}

function toneForReadiness(text: string): 'success' | 'warning' | 'info' | 'neutral' {
  const normalized = String(text || '').toLowerCase();
  if (normalized.includes('ready')) return 'success';
  if (normalized.includes('needs')) return 'warning';
  if (normalized.includes('partial')) return 'info';
  return 'neutral';
}

function summarizeMarketSignal(detail: PropertyDetailEnvelope | null) {
  if (!detail) return 'Not available from current endpoint';
  const docs = Array.isArray(detail.documents) ? detail.documents : [];
  if (docs.length === 0) return 'Missing';

  const hasTkgmParcel = docs.some((doc) => {
    const type = String(doc.documentType || '').toUpperCase();
    const name = String(doc.originalName || '').toUpperCase();
    return type.includes('TKGM') || name.includes('TKGM') || name.includes('PARSEL');
  });

  const hasTkgmMarketSignal = docs.some((doc) => {
    const type = String(doc.documentType || '').toUpperCase();
    const name = String(doc.originalName || '').toUpperCase();
    return type.includes('PRICE_HISTORY') || name.includes('PRICE') || name.includes('SATIM') || name.includes('TKGM');
  });

  if (hasTkgmParcel && hasTkgmMarketSignal) return 'TKGM parcel + market signal evidence';
  if (hasTkgmMarketSignal) return 'TKGM market signal evidence only';
  if (hasTkgmParcel) return 'TKGM parcel evidence only';
  return 'Supporting evidence only';
}

export default function AdminDealFlow() {
  const { user, isAdmin, authStatus, hasPersistentSession } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<DealFlowRow[]>([]);
  const [filter, setFilter] = useState<FilterKey>('ALL');

  if (authStatus === 'booting' || authStatus === 'checking' || (hasPersistentSession && !user)) {
    return <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">Oturum dogrulaniyor...</div>;
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
          apiFetch('/admin/users?page=1&limit=200'),
          apiFetch('/admin/analyses?page=1&limit=200'),
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

        const analysisCountByProperty = new Map<string, number>();
        analyses.forEach((run) => {
          const propertyId = String(run.propertySubmissionId?._id || '');
          if (!propertyId) return;
          analysisCountByProperty.set(propertyId, (analysisCountByProperty.get(propertyId) || 0) + 1);
        });

        const detailEntries = await Promise.all(
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
        detailEntries.forEach((entry) => detailMap.set(entry.propertyId, entry.detail));

        const mapped: DealFlowRow[] = properties.map((property) => {
          const propertyId = String(property._id);
          const detail = detailMap.get(propertyId) || null;
          const evidenceCount = Array.isArray(detail?.documents) ? detail.documents.length : null;
          const analysisCount = analysisCountByProperty.get(propertyId) || 0;
          const isOptedIn = property.dealFlowConsentStatus === 'OPTED_IN';
          const contactAllowed = Boolean(property.professionalContactAllowed);
          const needsEvidence = evidenceCount === 0;
          const readyForReview = isOptedIn && contactAllowed && typeof evidenceCount === 'number' && evidenceCount > 0;

          const uid = toUserId(property.userId);
          const mappedUser = uid ? userMap.get(uid) : null;
          const embeddedUser = typeof property.userId === 'object' ? property.userId : null;

          const userDisplay = mappedUser
            ? `${mappedUser.name || mappedUser.email || mappedUser._id}${mappedUser.email && mappedUser.name ? ` (${mappedUser.email})` : ''}`
            : embeddedUser?.email || embeddedUser?.name || (uid ? shortenId(uid) : 'Not available from current endpoint');

          const evidenceReadinessText =
            evidenceCount === null
              ? 'Not available from current endpoint'
              : readyForReview
              ? 'Ready for review'
              : evidenceCount > 0
              ? 'Partial supporting evidence'
              : 'Needs evidence';

          const missingEvidenceText =
            evidenceCount === null
              ? 'Not available from current endpoint'
              : evidenceCount === 0
              ? 'Missing evidence: 1+ required'
              : 'Missing evidence: 0 (has uploads)';

          return {
            propertyId,
            propertyTitle: property.addressText || 'Not available from current endpoint',
            location: [property.il, property.ilce, property.mahalleOrKoy].filter(Boolean).join(' / ') || 'Not available from current endpoint',
            userDisplay,
            assetTypeText: property.assetType || 'Not available from current endpoint',
            askingPriceText: formatMoney(property.askingPriceTRY),
            areaText: typeof property.areaM2 === 'number' ? `${property.areaM2} m2` : '-',
            consentStatusText: consentStatusLabel(property.dealFlowConsentStatus),
            consentAtText: formatDate(property.dealFlowConsentAt),
            contactPermissionText: contactAllowed ? 'Allowed' : 'Not allowed',
            evidenceReadinessText,
            missingEvidenceText,
            marketSignalText: summarizeMarketSignal(detail),
            analysisRunsText: `${analysisCount} run(s)`,
            updatedText: formatDate(property.updatedAt || property.createdAt),
            isOptedIn,
            contactAllowed,
            needsEvidence,
            readyForReview,
          };
        });

        if (!cancelled) {
          setRows(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          const e = err as { error?: string; message?: string };
          setError(e.error || e.message || 'Professional deal-flow dashboard could not be loaded');
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

  const summary = useMemo(() => {
    return {
      totalOptInCases: rows.filter((row) => row.isOptedIn).length,
      contactAllowedCases: rows.filter((row) => row.contactAllowed).length,
      needsEvidenceCases: rows.filter((row) => row.needsEvidence).length,
      readyForReviewCases: rows.filter((row) => row.readyForReview).length,
      notEligibleCases: rows.filter((row) => !row.isOptedIn || !row.contactAllowed).length,
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (filter === 'OPTED_IN') return rows.filter((row) => row.isOptedIn);
    if (filter === 'CONTACT_ALLOWED') return rows.filter((row) => row.contactAllowed);
    if (filter === 'NEEDS_EVIDENCE') return rows.filter((row) => row.needsEvidence);
    if (filter === 'READY_FOR_REVIEW') return rows.filter((row) => row.readyForReview);
    return rows;
  }, [filter, rows]);

  return (
    <AdminLayout title="Professional Deal-Flow">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="space-y-4 p-4 sm:p-5">
          <AdminHeader
            title="Professional Deal-Flow"
            subtitle="Internal intake shell for future professional matching pipeline readiness."
            actions={
              <div className="flex flex-wrap gap-2 text-sm">
                <Link to="/admin/cms" className="rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50">
                  Back to CMS
                </Link>
                <Link to="/admin/analysis-reports" className="rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50">
                  Admin Analysis Registry
                </Link>
              </div>
            }
          />

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Internal admin preview. Opt-in cases only. No external sharing is active.
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            This dashboard prepares future professional matching. It does not send leads, share user data, or create a marketplace yet.
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-500">Total opt-in cases</div>
              <div className="mt-1 text-xl font-semibold text-slate-900">{summary.totalOptInCases}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-500">Contact allowed</div>
              <div className="mt-1 text-xl font-semibold text-slate-900">{summary.contactAllowedCases}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-500">Needs evidence</div>
              <div className="mt-1 text-xl font-semibold text-slate-900">{summary.needsEvidenceCases}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-500">Ready for review</div>
              <div className="mt-1 text-xl font-semibold text-slate-900">{summary.readyForReviewCases}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-500">Missing consent / not eligible</div>
              <div className="mt-1 text-xl font-semibold text-slate-900">{summary.notEligibleCases}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: 'ALL', label: 'All' },
                { key: 'OPTED_IN', label: 'Opted in' },
                { key: 'CONTACT_ALLOWED', label: 'Contact allowed' },
                { key: 'NEEDS_EVIDENCE', label: 'Needs evidence' },
                { key: 'READY_FOR_REVIEW', label: 'Ready for review' },
              ] as Array<{ key: FilterKey; label: string }>
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`rounded border px-3 py-1.5 text-sm ${
                  filter === tab.key
                    ? 'border-slate-800 bg-slate-800 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error ? <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
          {loading ? <div className="text-sm text-slate-500">Loading professional deal-flow dashboard...</div> : null}

          {!loading && summary.totalOptInCases === 0 ? (
            <AdminEmptyState>
              Known beta data may not contain opt-in professional matching cases yet. New property submissions with consent will appear here.
            </AdminEmptyState>
          ) : null}

          {!loading && filteredRows.length > 0 ? (
            <div className="overflow-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Property / Location</th>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Asset / Price / Area</th>
                    <th className="px-3 py-2">Consent</th>
                    <th className="px-3 py-2">Contact Permission</th>
                    <th className="px-3 py-2">Evidence / Readiness</th>
                    <th className="px-3 py-2">Market Signal / TKGM</th>
                    <th className="px-3 py-2">Dates</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRows.map((row) => (
                    <tr key={row.propertyId}>
                      <td className="px-3 py-2 align-top">
                        <div className="font-medium text-slate-900">{row.propertyTitle}</div>
                        <div className="text-xs text-slate-600">{row.location}</div>
                        <div className="mt-1 font-mono text-[11px] text-slate-500">{row.propertyId}</div>
                      </td>
                      <td className="px-3 py-2 align-top text-slate-700">{row.userDisplay}</td>
                      <td className="px-3 py-2 align-top text-slate-700">
                        <div>{row.assetTypeText}</div>
                        <div className="text-xs text-slate-600">{row.askingPriceText}</div>
                        <div className="text-xs text-slate-600">{row.areaText}</div>
                      </td>
                      <td className="px-3 py-2 align-top text-slate-700">
                        <div>{row.consentStatusText}</div>
                        <div className="text-xs text-slate-500">At: {row.consentAtText}</div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <AdminStatusPill tone={toneForBoolean(row.contactAllowed)}>{row.contactPermissionText}</AdminStatusPill>
                      </td>
                      <td className="px-3 py-2 align-top text-slate-700">
                        <div className="mb-1">
                          <AdminStatusPill tone={toneForReadiness(row.evidenceReadinessText)}>{row.evidenceReadinessText}</AdminStatusPill>
                        </div>
                        <div className="text-xs text-slate-500">{row.missingEvidenceText}</div>
                        <div className="text-xs text-slate-500">Analysis: {row.analysisRunsText}</div>
                      </td>
                      <td className="px-3 py-2 align-top text-slate-700">{row.marketSignalText}</td>
                      <td className="px-3 py-2 align-top text-xs text-slate-600">{row.updatedText}</td>
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
                            Documents
                          </Link>
                          <Link
                            to={`/properties/${row.propertyId}/result`}
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            Result/Report
                          </Link>
                          <Link
                            to="/admin/analysis-reports"
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            Admin Analysis Registry
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {!loading && filteredRows.length === 0 && summary.totalOptInCases > 0 ? (
            <AdminEmptyState>No records for the selected filter.</AdminEmptyState>
          ) : null}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <div>No hidden data use. This view only reflects admin-accessible consented property metadata.</div>
            <div>No external sharing is active yet. No lead transfer is performed from this dashboard.</div>
            <div>No official valuation, legal, tapu, cadastral, municipality, or zoning proof claim is made.</div>
          </div>
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
