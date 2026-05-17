import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';
import {
  AdminButton,
  AdminEmptyState,
  AdminHeader,
  AdminInput,
  AdminPage,
  AdminStatusPill,
  AdminSurface,
  AdminTable,
  AdminTableWrap,
  AdminTd,
  AdminTh,
  AdminToolbar,
} from '../components/admin';

type AuditEvent = {
  _id: string;
  createdAt: string;
  type?: string;
  actorUserId?: string;
  actorRole?: string;
  targetType?: string;
  targetId?: string;
  message?: string;
  success?: boolean;
  metadata?: Record<string, unknown>;
};

type AuditResponse = {
  events?: AuditEvent[];
  items?: AuditEvent[];
  totalPages?: number;
};

const shortenId = (value?: string) => {
  if (!value) return '';
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
};

const metadataToText = (metadata?: Record<string, unknown>) => {
  if (!metadata) return '';
  return Object.keys(metadata)
    .map((key) => {
      const value = metadata[key];
      return `${key}: ${typeof value === 'object' && value !== null ? '[obj]' : String(value)}`;
    })
    .join(', ');
};

export default function AdminAuditTimeline() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [error, setError] = useState('');
  const [type, setType] = useState('');
  const [actorUserId, setActorUserId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  async function fetchEvents() {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();

      if (type) params.append('type', type);
      if (actorUserId) params.append('actorUserId', actorUserId);

      params.append('page', String(page));

      const data = (await apiFetch(`/admin/audit-events?${params.toString()}`)) as AuditResponse;

      const rows = Array.isArray(data?.events)
        ? data.events
        : Array.isArray(data?.items)
        ? data.items
        : [];

      setEvents(rows);
      setTotalPages(Number(data?.totalPages || 1));
    } catch (e) {
      setError((e as { error?: string; message?: string }).error || (e as Error).message || 'Audit verileri alınamadı');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, actorUserId, page]);

  if (!user || user.role !== 'ADMIN') {
    return <div>Yönetici yetkisi gerekli</div>;
  }

  if (error) {
    return <div>Hata: {error}</div>;
  }

  return (
    <AdminPage className="overflow-x-hidden">
      <AdminSurface className="p-4 sm:p-5 space-y-4">
        <AdminHeader title="Audit Timeline" subtitle="Sistem ve yönetici işlemlerinin olay akışı" />

        <AdminToolbar>
          <AdminInput
            className="w-full sm:w-56"
            placeholder="Type filter"
            value={type}
            onChange={(e) => {
              setPage(1);
              setType(e.target.value);
            }}
          />

          <AdminInput
            className="w-full sm:w-64"
            placeholder="ActorUserId filter"
            value={actorUserId}
            onChange={(e) => {
              setPage(1);
              setActorUserId(e.target.value);
            }}
          />

          <AdminButton
            onClick={() => {
              setType('');
              setActorUserId('');
              setPage(1);
            }}
          >
            Clear
          </AdminButton>
        </AdminToolbar>

        <AdminTableWrap className="overflow-hidden">
          <AdminTable className="w-full table-fixed text-[11px] sm:text-xs">
            <thead>
              <tr>
                <AdminTh className="w-[14%]">Time</AdminTh>
                <AdminTh className="w-[12%]">Type</AdminTh>
                <AdminTh className="w-[16%]">Actor</AdminTh>
                <AdminTh className="w-[16%]">Target</AdminTh>
                <AdminTh className="w-[18%]">Message</AdminTh>
                <AdminTh className="w-[8%] text-center">Success</AdminTh>
                <AdminTh className="w-[16%]">Metadata</AdminTh>
              </tr>
            </thead>

            <tbody>
              {!loading && events.map((ev) => (
                <tr key={ev._id} className={ev.success ? '' : 'bg-red-50/60'}>
                  <AdminTd className="whitespace-nowrap">
                    {new Date(ev.createdAt).toLocaleString()}
                  </AdminTd>

                  <AdminTd className="break-words">{ev.type || ''}</AdminTd>

                  <AdminTd className="break-words">
                    {ev.actorUserId ? (
                      <span title={ev.actorUserId}>{shortenId(ev.actorUserId)}</span>
                    ) : null}{' '}
                    {ev.actorRole || ''}
                  </AdminTd>

                  <AdminTd className="break-words">
                    {ev.targetType || ''}{' '}
                    {ev.targetId ? <span title={ev.targetId}>{shortenId(ev.targetId)}</span> : null}
                  </AdminTd>

                  <AdminTd className="break-words whitespace-normal">{ev.message || ''}</AdminTd>

                  <AdminTd className="text-center">
                    <AdminStatusPill tone={ev.success ? 'success' : 'danger'}>
                      {ev.success ? '✓' : '✗'}
                    </AdminStatusPill>
                  </AdminTd>

                  <AdminTd
                    className="break-words whitespace-normal"
                    title={JSON.stringify(ev.metadata || {})}
                  >
                    {metadataToText(ev.metadata)}
                  </AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </AdminTableWrap>

        {loading ? <div className="text-sm text-slate-500">Loading...</div> : null}
        {!loading && events.length === 0 ? <AdminEmptyState>Audit kaydı bulunamadı</AdminEmptyState> : null}

        <AdminToolbar className="justify-between">
          <div className="text-sm text-slate-600">
            Page {page} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <AdminButton
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Prev
            </AdminButton>
            <AdminButton
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
            </AdminButton>
          </div>
        </AdminToolbar>
      </AdminSurface>
    </AdminPage>
  );
}