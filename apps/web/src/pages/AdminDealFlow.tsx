import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import {
  AdminEmptyState,
  AdminHeader,
  AdminInput,
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

type LeadQualityLabel = 'STRONG_SIGNAL' | 'REVIEWABLE' | 'NEEDS_EVIDENCE' | 'LOW_INFORMATION' | 'NOT_ELIGIBLE';

type EvidenceSignal = 'EVIDENCE_UPLOADED' | 'NEEDS_EVIDENCE' | 'UNAVAILABLE';

type ReadinessSignal = 'REPORT_REVIEWABLE' | 'NEEDS_MISSING_EVIDENCE' | 'UNAVAILABLE';

type MarketSignal = 'TKGM_MARKET_SIGNAL_PRESENT' | 'MARKET_SIGNAL_MISSING' | 'UNAVAILABLE';

type NextAction =
  | 'REQUEST_MISSING_EVIDENCE'
  | 'REVIEW_RESULT_REPORT'
  | 'CONTACT_ALLOWED_USER'
  | 'KEEP_INTERNAL_ONLY'
  | 'NOT_ELIGIBLE_WITHOUT_CONSENT';

type DealFlowRow = {
  propertyId: string;
  propertyTitle: string;
  location: string;
  city: string;
  district: string;
  neighborhood: string;
  userDisplay: string;
  assetTypeText: string;
  askingPriceValue: number | null;
  askingPriceText: string;
  areaValue: number | null;
  areaText: string;
  consentStatusText: string;
  consentAtText: string;
  contactPermissionText: string;
  evidenceSignal: EvidenceSignal;
  evidenceSignalText: string;
  readinessSignal: ReadinessSignal;
  readinessSignalText: string;
  missingEvidenceCountText: string;
  marketSignal: MarketSignal;
  marketSignalText: string;
  analysisRunsText: string;
  analysisRunsCount: number;
  updatedText: string;
  updatedAtEpoch: number;
  leadQuality: LeadQualityLabel;
  leadQualityText: string;
  nextAction: NextAction;
  nextActionText: string;
  isOptedIn: boolean;
  contactAllowed: boolean;
  needsEvidence: boolean;
  readyForReview: boolean;
  hasLocation: boolean;
  hasPriceOrArea: boolean;
};

type FilterKey = 'ALL' | 'OPTED_IN' | 'CONTACT_ALLOWED' | 'NEEDS_EVIDENCE' | 'READY_FOR_REVIEW';

type SortKey = 'NEWEST' | 'OLDEST' | 'HIGHEST_PRICE';

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
  if (!detail) {
    return {
      signal: 'UNAVAILABLE' as MarketSignal,
      text: 'Not available from current endpoint',
    };
  }
  const docs = Array.isArray(detail.documents) ? detail.documents : [];
  if (docs.length === 0) {
    return {
      signal: 'MARKET_SIGNAL_MISSING' as MarketSignal,
      text: 'Market signal missing',
    };
  }

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

  if (hasTkgmMarketSignal) {
    return {
      signal: 'TKGM_MARKET_SIGNAL_PRESENT' as MarketSignal,
      text: hasTkgmParcel ? 'TKGM market signal present (parcel evidence also present)' : 'TKGM market signal present',
    };
  }

  return {
    signal: 'MARKET_SIGNAL_MISSING' as MarketSignal,
    text: hasTkgmParcel ? 'Market signal missing (TKGM parcel evidence only)' : 'Market signal missing',
  };
}

function leadQualityText(label: LeadQualityLabel) {
  if (label === 'STRONG_SIGNAL') return 'STRONG_SIGNAL';
  if (label === 'REVIEWABLE') return 'REVIEWABLE';
  if (label === 'NEEDS_EVIDENCE') return 'NEEDS_EVIDENCE';
  if (label === 'LOW_INFORMATION') return 'LOW_INFORMATION';
  return 'NOT_ELIGIBLE';
}

function leadQualityTone(label: LeadQualityLabel): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (label === 'STRONG_SIGNAL') return 'success';
  if (label === 'REVIEWABLE') return 'info';
  if (label === 'NEEDS_EVIDENCE') return 'warning';
  if (label === 'LOW_INFORMATION') return 'warning';
  return 'neutral';
}

function evidenceSignalText(value: EvidenceSignal) {
  if (value === 'EVIDENCE_UPLOADED') return 'Evidence uploaded';
  if (value === 'NEEDS_EVIDENCE') return 'Needs evidence';
  return 'Evidence status unavailable';
}

function readinessSignalText(value: ReadinessSignal) {
  if (value === 'REPORT_REVIEWABLE') return 'Report reviewable';
  if (value === 'NEEDS_MISSING_EVIDENCE') return 'Needs missing evidence';
  return 'Readiness unavailable';
}

function marketSignalTone(value: MarketSignal): 'success' | 'warning' | 'neutral' {
  if (value === 'TKGM_MARKET_SIGNAL_PRESENT') return 'success';
  if (value === 'MARKET_SIGNAL_MISSING') return 'warning';
  return 'neutral';
}

function nextActionText(value: NextAction) {
  if (value === 'NOT_ELIGIBLE_WITHOUT_CONSENT') return 'Not eligible for deal-flow without consent';
  if (value === 'REQUEST_MISSING_EVIDENCE') return 'Request missing evidence';
  if (value === 'REVIEW_RESULT_REPORT') return 'Review result/report';
  if (value === 'CONTACT_ALLOWED_USER') return 'Contact allowed user';
  return 'Keep internal only';
}

function calculateLeadQuality(input: {
  isOptedIn: boolean;
  contactAllowed: boolean;
  hasEvidence: boolean;
  evidenceUnavailable: boolean;
  hasLocation: boolean;
  hasPriceOrArea: boolean;
}): LeadQualityLabel {
  const { isOptedIn, contactAllowed, hasEvidence, evidenceUnavailable, hasLocation, hasPriceOrArea } = input;
  if (!isOptedIn) return 'NOT_ELIGIBLE';
  if (evidenceUnavailable && !hasLocation && !hasPriceOrArea) return 'LOW_INFORMATION';
  if (!hasEvidence) {
    if (!hasLocation && !hasPriceOrArea) return 'LOW_INFORMATION';
    return 'NEEDS_EVIDENCE';
  }
  if (contactAllowed && hasLocation && hasPriceOrArea) return 'STRONG_SIGNAL';
  if (hasLocation && (hasEvidence || hasPriceOrArea)) return 'REVIEWABLE';
  return 'LOW_INFORMATION';
}

export default function AdminDealFlow() {
  const { user, isAdmin, authStatus, hasPersistentSession } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<DealFlowRow[]>([]);
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [locationQuery, setLocationQuery] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('NEWEST');

  if (authStatus === 'booting' || authStatus === 'checking' || (hasPersistentSession && !user)) {
    return <div className="premium-admin premium-surface max-w-md mx-auto mt-20 p-6 rounded shadow">Oturum dogrulaniyor...</div>;
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
          const evidenceUnavailable = evidenceCount === null;
          const hasEvidence = typeof evidenceCount === 'number' && evidenceCount > 0;
          const analysisCount = analysisCountByProperty.get(propertyId) || 0;
          const isOptedIn = property.dealFlowConsentStatus === 'OPTED_IN';
          const contactAllowed = Boolean(property.professionalContactAllowed);
          const city = String(property.il || '').trim();
          const district = String(property.ilce || '').trim();
          const neighborhood = String(property.mahalleOrKoy || '').trim();
          const hasLocation = Boolean(city || district || neighborhood);

          const askingPriceValue = typeof property.askingPriceTRY === 'number' && Number.isFinite(property.askingPriceTRY)
            ? property.askingPriceTRY
            : null;
          const areaValue = typeof property.areaM2 === 'number' && Number.isFinite(property.areaM2) ? property.areaM2 : null;
          const hasPriceOrArea = askingPriceValue !== null || areaValue !== null;

          const needsEvidence = evidenceCount === 0;
          const readyForReview = isOptedIn && hasEvidence && analysisCount > 0;

          const uid = toUserId(property.userId);
          const mappedUser = uid ? userMap.get(uid) : null;
          const embeddedUser = typeof property.userId === 'object' ? property.userId : null;

          const userDisplay = mappedUser
            ? `${mappedUser.name || mappedUser.email || mappedUser._id}${mappedUser.email && mappedUser.name ? ` (${mappedUser.email})` : ''}`
            : embeddedUser?.email || embeddedUser?.name || (uid ? shortenId(uid) : 'Not available from current endpoint');

          const evidenceSignal: EvidenceSignal =
            evidenceUnavailable ? 'UNAVAILABLE' : hasEvidence ? 'EVIDENCE_UPLOADED' : 'NEEDS_EVIDENCE';
          const readinessSignal: ReadinessSignal = evidenceUnavailable
            ? 'UNAVAILABLE'
            : readyForReview
            ? 'REPORT_REVIEWABLE'
            : 'NEEDS_MISSING_EVIDENCE';

          const missingEvidenceCountText = evidenceUnavailable
            ? 'Not available from current endpoint'
            : hasEvidence
            ? 'Missing evidence count: 0'
            : 'Missing evidence count: 1+';

          const market = summarizeMarketSignal(detail);

          const leadQuality = calculateLeadQuality({
            isOptedIn,
            contactAllowed,
            hasEvidence,
            evidenceUnavailable,
            hasLocation,
            hasPriceOrArea,
          });

          const nextAction: NextAction = !isOptedIn
            ? 'NOT_ELIGIBLE_WITHOUT_CONSENT'
            : !hasEvidence
            ? 'REQUEST_MISSING_EVIDENCE'
            : analysisCount > 0
            ? contactAllowed
              ? 'CONTACT_ALLOWED_USER'
              : 'REVIEW_RESULT_REPORT'
            : 'KEEP_INTERNAL_ONLY';

          return {
            propertyId,
            propertyTitle: property.addressText || 'Not available from current endpoint',
            location: [city, district, neighborhood].filter(Boolean).join(' / ') || 'Not available from current endpoint',
            city,
            district,
            neighborhood,
            userDisplay,
            assetTypeText: property.assetType || 'Not available from current endpoint',
            askingPriceValue,
            askingPriceText: formatMoney(askingPriceValue || undefined),
            areaValue,
            areaText: areaValue !== null ? `${areaValue} m2` : '-',
            consentStatusText: consentStatusLabel(property.dealFlowConsentStatus),
            consentAtText: formatDate(property.dealFlowConsentAt),
            contactPermissionText: contactAllowed ? 'Allowed' : 'Not allowed',
            evidenceSignal,
            evidenceSignalText: evidenceSignalText(evidenceSignal),
            readinessSignal,
            readinessSignalText: readinessSignalText(readinessSignal),
            missingEvidenceCountText,
            marketSignal: market.signal,
            marketSignalText: market.text,
            analysisRunsText: `${analysisCount} run(s)`,
            analysisRunsCount: analysisCount,
            updatedText: formatDate(property.updatedAt || property.createdAt),
            updatedAtEpoch: new Date(property.updatedAt || property.createdAt || 0).getTime() || 0,
            leadQuality,
            leadQualityText: leadQualityText(leadQuality),
            nextAction,
            nextActionText: nextActionText(nextAction),
            isOptedIn,
            contactAllowed,
            needsEvidence,
            readyForReview,
            hasLocation,
            hasPriceOrArea,
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
    const normalizedLocationQuery = locationQuery.trim().toLowerCase();

    let next = rows.filter((row) => {
      if (filter === 'OPTED_IN' && !row.isOptedIn) return false;
      if (filter === 'CONTACT_ALLOWED' && !row.contactAllowed) return false;
      if (filter === 'NEEDS_EVIDENCE' && !row.needsEvidence) return false;
      if (filter === 'READY_FOR_REVIEW' && !row.readyForReview) return false;

      if (assetTypeFilter !== 'ALL') {
        const asset = String(row.assetTypeText || '').trim().toUpperCase();
        if (asset !== assetTypeFilter) return false;
      }

      if (normalizedLocationQuery) {
        const haystack = `${row.propertyTitle} ${row.location} ${row.city} ${row.district} ${row.neighborhood}`.toLowerCase();
        if (!haystack.includes(normalizedLocationQuery)) return false;
      }

      return true;
    });

    next = [...next].sort((a, b) => {
      if (sortKey === 'OLDEST') {
        return a.updatedAtEpoch - b.updatedAtEpoch;
      }
      if (sortKey === 'HIGHEST_PRICE') {
        return (b.askingPriceValue || -1) - (a.askingPriceValue || -1);
      }
      return b.updatedAtEpoch - a.updatedAtEpoch;
    });

    return next;
  }, [assetTypeFilter, filter, locationQuery, rows, sortKey]);

  const assetTypeOptions = useMemo(() => {
    const options = Array.from(new Set(rows.map((row) => String(row.assetTypeText || '').trim().toUpperCase()).filter(Boolean))).sort();
    return options;
  }, [rows]);

  return (
    <AdminLayout title="Professional Deal-Flow">
      <AdminPage className="premium-admin p-0 sm:p-0">
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

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">City / location search</label>
              <AdminInput
                placeholder="Search city, district, neighborhood, address"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Asset type</label>
              <select
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                value={assetTypeFilter}
                onChange={(e) => setAssetTypeFilter(e.target.value)}
              >
                <option value="ALL">All asset types</option>
                {assetTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Sort order</label>
              <select
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
              >
                <option value="NEWEST">Newest first</option>
                <option value="OLDEST">Oldest first</option>
                <option value="HIGHEST_PRICE">Highest asking price</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-slate-600">{filteredRows.length} case(s) after filters</div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <div className="font-semibold text-slate-900">Lead quality legend</div>
            <div className="mt-1">STRONG_SIGNAL = opted in + contact allowed + evidence/core data available.</div>
            <div>REVIEWABLE = enough core data for admin review.</div>
            <div>NEEDS_EVIDENCE = missing supporting evidence.</div>
            <div>LOW_INFORMATION = insufficient property/evidence data.</div>
            <div>NOT_ELIGIBLE = no opt-in consent.</div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <div className="font-semibold text-slate-900">Admin opportunity signal</div>
            <div className="mt-1">Not available until OCR/intelligence run is implemented.</div>
            <div className="mt-1">Current view shows lead quality only. No buy recommendation or external sharing is active.</div>
          </div>

          {error ? <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
          {loading ? <div className="text-sm text-slate-500">Loading professional deal-flow dashboard...</div> : null}

          {!loading && summary.totalOptInCases === 0 ? (
            <AdminEmptyState>
              Known beta data may not contain opt-in professional matching cases yet. New property submissions with consent will appear here.
            </AdminEmptyState>
          ) : null}

          {!loading && filteredRows.length > 0 ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:hidden">
                {filteredRows.map((row) => (
                  <article key={`${row.propertyId}-mobile`} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="font-semibold text-slate-900 break-words">{row.propertyTitle}</div>
                    <div className="mt-1 text-xs text-slate-600">{row.location}</div>
                    <div className="mt-1 text-[11px] font-mono text-slate-500">{row.propertyId}</div>

                    <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-700">
                      <div><span className="font-medium">User:</span> {row.userDisplay}</div>
                      <div><span className="font-medium">Asset:</span> {row.assetTypeText} | {row.askingPriceText} | {row.areaText}</div>
                      <div><span className="font-medium">Consent:</span> {row.consentStatusText}</div>
                      <div><span className="font-medium">Contact:</span> {row.contactPermissionText}</div>
                      <div><span className="font-medium">Evidence:</span> {row.evidenceSignalText}</div>
                      <div><span className="font-medium">Readiness:</span> {row.readinessSignalText}</div>
                      <div><span className="font-medium">Market:</span> {row.marketSignalText}</div>
                      <div><span className="font-medium">Next action:</span> {row.nextActionText}</div>
                      <div><span className="font-medium">Updated:</span> {row.updatedText}</div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <AdminStatusPill tone={leadQualityTone(row.leadQuality)}>{row.leadQualityText}</AdminStatusPill>
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
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-auto rounded-lg border border-slate-200 md:block">
              <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Property / Location</th>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Asset / Price / Area</th>
                    <th className="px-3 py-2">Lead Quality</th>
                    <th className="px-3 py-2">Consent</th>
                    <th className="px-3 py-2">Contact Permission</th>
                    <th className="px-3 py-2">Evidence / Readiness</th>
                    <th className="px-3 py-2">Market Signal / TKGM</th>
                    <th className="px-3 py-2">Next Action</th>
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
                      <td className="px-3 py-2 align-top">
                        <div className="text-xs font-medium text-slate-800">Lead Quality: {row.leadQuality}</div>
                        <AdminStatusPill tone={leadQualityTone(row.leadQuality)}>{row.leadQualityText}</AdminStatusPill>
                        <div className="mt-1 text-[11px] text-slate-500">Internal triage signal only.</div>
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
                          <AdminStatusPill tone={toneForReadiness(row.evidenceSignalText)}>{row.evidenceSignalText}</AdminStatusPill>
                        </div>
                        <div className="mb-1">
                          <AdminStatusPill tone={toneForReadiness(row.readinessSignalText)}>{row.readinessSignalText}</AdminStatusPill>
                        </div>
                        <div className="text-xs text-slate-500">{row.missingEvidenceCountText}</div>
                        <div className="text-xs text-slate-500">Analysis runs: {row.analysisRunsText}</div>
                      </td>
                      <td className="px-3 py-2 align-top text-slate-700">
                        <AdminStatusPill tone={marketSignalTone(row.marketSignal)}>{row.marketSignalText}</AdminStatusPill>
                      </td>
                      <td className="px-3 py-2 align-top text-slate-700">
                        <div>{row.nextActionText}</div>
                        {row.contactAllowed ? <div className="text-xs text-slate-500">Contact allowed (no automated outreach).</div> : null}
                      </td>
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
            </div>
          ) : null}

          {!loading && filteredRows.length === 0 && summary.totalOptInCases > 0 ? (
            <AdminEmptyState>No records for the selected filter.</AdminEmptyState>
          ) : null}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <div>No hidden data use. This view only reflects admin-accessible consented property metadata.</div>
            <div>No external sharing is active yet. No lead transfer is performed from this dashboard.</div>
            <div>No professional account marketplace or automated lead distribution is active in this phase.</div>
            <div>No official valuation, legal, tapu, cadastral, municipality, or zoning proof claim is made.</div>
          </div>
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
