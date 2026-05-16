import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function AdminAuditTimeline() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/admin/audit-events', { credentials: 'include' })
      .then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t); }))
      .then(setEvents)
      .catch(e => setError(e.message));
  }, []);

  if (!user || user.role !== 'ADMIN') return <div>Yönetici yetkisi gerekli</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Audit Timeline</h1>
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
            </tr>
          </thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev._id} className={ev.success ? '' : 'bg-red-50'}>
                <td className="border px-2 whitespace-nowrap">{new Date(ev.createdAt).toLocaleString()}</td>
                <td className="border px-2">{ev.type}</td>
                <td className="border px-2">{ev.actorUserId || ''} {ev.actorRole || ''}</td>
                <td className="border px-2">{ev.targetType || ''} {ev.targetId || ''}</td>
                <td className="border px-2">{ev.message}</td>
                <td className="border px-2">{ev.success ? '✓' : '✗'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
