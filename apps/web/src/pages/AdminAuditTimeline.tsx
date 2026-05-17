import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../lib/api';

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
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Audit Timeline</h1>

      <div className="mb-2 flex gap-2 items-center">
        <input
          className="border px-2 py-1 text-xs"
          placeholder="Type filter"
          value={type}
          onChange={(e) => {
            setPage(1);
            setType(e.target.value);
          }}
        />

        <input
          className="border px-2 py-1 text-xs"
          placeholder="ActorUserId filter"
          value={actorUserId}
          onChange={(e) => {
            setPage(1);
            setActorUserId(e.target.value);
          }}
        />

        <button
          className="border px-2 py-1 text-xs"
          onClick={() => {
            setType('');
            setActorUserId('');
            setPage(1);
          }}
        >
          Clear
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-xs">
          <thead>
            <tr>
              <th className="border px-2">Time</th>
              <th className="border px-2">Type</th>
              <th className="border px-2">Actor</th>
              <th className="border px-2">Target</th>
              <th className="border px-2">Message</th>
              <th className="border px-2">Success</th>
              <th className="border px-2">Metadata</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : null}

            {!loading && events.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  Audit kaydı bulunamadı
                </td>
              </tr>
            ) : null}

            {events.map((ev) => (
              <tr key={ev._id} className={ev.success ? '' : 'bg-red-50'}>
                <td className="border px-2 whitespace-nowrap">
                  {new Date(ev.createdAt).toLocaleString()}
                </td>

                <td className="border px-2">{ev.type || ''}</td>

                <td className="border px-2">
                  {ev.actorUserId || ''} {ev.actorRole || ''}
                </td>

                <td className="border px-2">
                  {ev.targetType || ''} {ev.targetId || ''}
                </td>

                <td className="border px-2">{ev.message || ''}</td>

                <td className="border px-2">{ev.success ? '✓' : '✗'}</td>

                <td
                  className="border px-2 max-w-xs truncate"
                  title={JSON.stringify(ev.metadata || {})}
                >
                  {ev.metadata
                    ? Object.keys(ev.metadata)
                        .map((key) => {
                          const value = ev.metadata?.[key];
                          return `${key}: ${
                            typeof value === 'object' && value !== null
                              ? '[obj]'
                              : String(value)
                          }`;
                        })
                        .join(', ')
                    : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex gap-2 items-center">
        <button
          className="border px-2 py-1 text-xs"
          disabled={page <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Prev
        </button>

        <span>
          Page {page} / {totalPages}
        </span>

        <button
          className="border px-2 py-1 text-xs"
          disabled={page >= totalPages}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}