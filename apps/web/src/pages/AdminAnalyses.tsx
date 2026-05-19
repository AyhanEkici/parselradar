import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import { Link } from 'react-router-dom';
import {
  AdminButton,
  AdminEmptyState,
  AdminHeader,
  AdminLayout,
  AdminPage,
  AdminStatusPill,
  AdminSurface,
  AdminTable,
  AdminTableWrap,
  AdminTd,
  AdminTh,
  AdminToolbar,
} from '../components/admin';
import GovernanceBadge from '../components/governance/GovernanceBadge';

interface Analysis {
  _id: string;
  userId:
    | string
    | {
        _id?: string;
        name?: string;
        email?: string;
      };
  propertySubmissionId:
    | string
    | {
        _id?: string;
        addressText?: string;
        il?: string;
        ilce?: string;
      };
  score: number;
  signal?: string;
  reused: boolean;
  createdAt: string;
  fullAnalysis?: {
    governanceEnvelope?: {
      governanceClassification?: string;
      trustScore?: number;
    };
    territorialIntelligence?: {
      planningProbability?: { value?: string };
      longTermRegionalOutlook?: { value?: string };
    };
    ingestionCompliance?: {
      complianceState?: string;
    };
    noFakeActiveProof?: boolean;
    operationalIntelligence?: {
      monitoring?: { state?: string };
      opportunities?: { strategicOpportunity?: { level?: string } };
    };
  };
}

function shortenId(value?: string) {
  if (!value) return '-';
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function renderUserIdentity(userId: Analysis['userId']) {
  if (typeof userId === 'string') {
    return <span title={userId}>{shortenId(userId)}</span>;
  }

  const name = userId?.name?.trim();
  const email = userId?.email?.trim();

  if (name || email) {
    return (
      <div className="leading-5">
        <div className="font-medium text-slate-900">{name || email}</div>
        {email && name ? <div className="text-xs text-slate-500">{email}</div> : null}
      </div>
    );
  }

  return <span title={userId?._id}>{shortenId(userId?._id)}</span>;
}

export default function AdminAnalyses() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function fetchAnalyses() {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page', String(page));
    apiFetch(`/admin/analyses?${params.toString()}`)
      .then((data) => {
        setAnalyses(data.analyses);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || 'Hata');
        setLoading(false);
      });
  }

  useEffect(() => { fetchAnalyses(); /* eslint-disable-next-line */ }, [page]);

  if (!user || user.role !== 'ADMIN') return <div>Yönetici yetkisi gerekli</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <AdminLayout title="Analyses">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="p-4 sm:p-5 space-y-4">
        <AdminHeader
          title="Analizler"
          subtitle="Skor, sinyal ve yeniden kullanım durumlarıyla analiz kayıtlarını izleyin"
        />

        <AdminTableWrap>
          <AdminTable>
            <thead>
              <tr>
                <AdminTh>Score</AdminTh>
                <AdminTh>Signal</AdminTh>
                <AdminTh>Reused</AdminTh>
                <AdminTh>Governance</AdminTh>
                <AdminTh>Territorial</AdminTh>
                <AdminTh>Ingestion</AdminTh>
                <AdminTh>Operational</AdminTh>
                <AdminTh>Property</AdminTh>
                <AdminTh>User</AdminTh>
                <AdminTh>Oluşturulma</AdminTh>
              </tr>
            </thead>
            <tbody>
              {!loading && analyses.map((a) => (
                <tr key={a._id} className="hover:bg-slate-50/70 transition-colors">
                  <AdminTd>
                    <span className="inline-flex min-w-[3rem] justify-center rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                      {typeof a.score === 'number' ? a.score : '-'}
                    </span>
                  </AdminTd>
                  <AdminTd>
                    <AdminStatusPill tone={a.signal ? 'info' : 'neutral'}>{a.signal || '-'}</AdminStatusPill>
                  </AdminTd>
                  <AdminTd>
                    <AdminStatusPill tone={a.reused ? 'success' : 'neutral'}>
                      {a.reused ? 'Evet' : 'Hayır'}
                    </AdminStatusPill>
                  </AdminTd>
                  <AdminTd>
                    <div className="space-y-1">
                      <GovernanceBadge classification={a.fullAnalysis?.governanceEnvelope?.governanceClassification} />
                      <div className="text-xs text-slate-500">Trust: {a.fullAnalysis?.governanceEnvelope?.trustScore ?? '-'}</div>
                    </div>
                  </AdminTd>
                  <AdminTd>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div>Dev Prob: {a.fullAnalysis?.territorialIntelligence?.developmentProbability?.value || '-'}</div>
                      <div>Outlook: {a.fullAnalysis?.territorialIntelligence?.longTermRegionalOutlook?.value || '-'}</div>
                    </div>
                  </AdminTd>
                  <AdminTd>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div>Compliance: {a.fullAnalysis?.ingestionCompliance?.complianceState || '-'}</div>
                      <div>No fake ACTIVE: {a.fullAnalysis?.noFakeActiveProof ? 'PASS' : 'FAIL'}</div>
                    </div>
                  </AdminTd>
                  <AdminTd>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div>Monitoring: {a.fullAnalysis?.operationalIntelligence?.monitoring?.state || '-'}</div>
                      <div>Opportunity: {a.fullAnalysis?.operationalIntelligence?.opportunities?.strategicOpportunity?.level || '-'}</div>
                    </div>
                  </AdminTd>
                  <AdminTd className="break-words">
                    {typeof a.propertySubmissionId === 'object' ? (
                      <Link
                        className="text-blue-600 hover:underline"
                        to={`/admin/properties/${a.propertySubmissionId._id}`}
                      >
                        {a.propertySubmissionId.addressText || 'Adres girilmemiş'}
                        {a.propertySubmissionId.il || a.propertySubmissionId.ilce
                          ? ` (${a.propertySubmissionId.il || '-'} / ${a.propertySubmissionId.ilce || '-'})`
                          : ''}
                      </Link>
                    ) : (
                      <span title={a.propertySubmissionId}>{shortenId(a.propertySubmissionId)}</span>
                    )}
                  </AdminTd>
                  <AdminTd className="break-words">{renderUserIdentity(a.userId)}</AdminTd>
                  <AdminTd className="whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </AdminTableWrap>

        {loading ? <div className="text-sm text-slate-500">Yükleniyor...</div> : null}
        {!loading && analyses.length === 0 ? (
          <AdminEmptyState>
            Bu sayfada gösterilecek analiz kaydı bulunamadı.
          </AdminEmptyState>
        ) : null}

        <AdminToolbar className="justify-between">
          <div className="text-sm text-slate-600">Sayfa {page} / {totalPages}</div>
          <div className="flex items-center gap-2">
            <AdminButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Önceki
            </AdminButton>
            <AdminButton disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Sonraki
            </AdminButton>
          </div>
        </AdminToolbar>
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
