
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function AdminAuditTimeline() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [type, setType] = useState('');
  const [actorUserId, setActorUserId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  function fetchEvents() {
    setLoading(true);
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (actorUserId) params.append('actorUserId', actorUserId);
    params.append('page', String(page));
    fetch(`/admin/audit-events?${params.toString()}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t); }))
      .then(data => {
        setEvents(data.events);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }

  useEffect(() => { fetchEvents(); /* eslint-disable-next-line */ }, [type, actorUserId, page]);

  if (!user || user.role !== 'ADMIN') return <div>Yönetici yetkisi gerekli</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Audit Timeline</h1>
      <div className="mb-2 flex gap-2 items-center">
        <input className="border px-2 py-1 text-xs" placeholder="Type filter" value={type} onChange={e => { setPage(1); setType(e.target.value); }} />
        <input className="border px-2 py-1 text-xs" placeholder="ActorUserId filter" value={actorUserId} onChange={e => { setPage(1); setActorUserId(e.target.value); }} />
        <button className="border px-2 py-1 text-xs" onClick={() => { setType(''); setActorUserId(''); setPage(1); }}>Clear</button>
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
            {loading ? <tr><td colSpan={7} className="text-center">Loading...</td></tr> : null}
            {events.map(ev => (
              <tr key={ev._id} className={ev.success ? '' : 'bg-red-50'}>
                <td className="border px-2 whitespace-nowrap">{new Date(ev.createdAt).toLocaleString()}</td>
                <td className="border px-2">{ev.type}</td>
                <td className="border px-2">{ev.actorUserId || ''} {ev.actorRole || ''}</td>
                <td className="border px-2">{ev.targetType || ''} {ev.targetId || ''}</td>
                <td className="border px-2">{ev.message}</td>
                <td className="border px-2">{ev.success ? '✓' : '✗'}</td>
                <td className="border px-2 max-w-xs truncate" title={JSON.stringify(ev.metadata)}>{ev.metadata ? Object.keys(ev.metadata).map(k => `${k}: ${typeof ev.metadata[k] === 'object' ? '[obj]' : String(ev.metadata[k])}`).join(', ') : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex gap-2 items-center">
        <button className="border px-2 py-1 text-xs" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
        <span>Page {page} / {totalPages}</span>
        <button className="border px-2 py-1 text-xs" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
      </div>
    </div>
  );
}
