import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import NotificationCard from '../components/notifications/NotificationCard';
import NotificationDigestCard from '../components/notifications/NotificationDigestCard';
import NotificationEmptyState from '../components/notifications/NotificationEmptyState';

export default function NotificationInbox() {
  const [inbox, setInbox] = useState<any>(null);
  const [digests, setDigests] = useState<any[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [inboxPayload, digestsPayload] = await Promise.all([
        apiFetch('notifications'),
        apiFetch('notifications/digests'),
      ]);
      setInbox(inboxPayload);
      setDigests(Array.isArray(digestsPayload) ? digestsPayload : []);
    } catch (err: any) {
      setError(err?.error || 'Notifications yüklenemedi');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: string) => {
    await apiFetch(`notifications/${id}/read`, { method: 'POST' });
    await load();
  };

  const archive = async (id: string) => {
    await apiFetch(`notifications/${id}/archive`, { method: 'POST' });
    await load();
  };

  const createTestEvent = async () => {
    await apiFetch('notifications/test-event', { method: 'POST', body: JSON.stringify({ type: 'opportunity_detected' }) });
    await load();
  };

  const events = inbox?.events || [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Notification Inbox</h1>
          <div className="flex gap-2">
            <button
              onClick={createTestEvent}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Create Test Event
            </button>
            <Link to="/notifications/preferences" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-white">
              Preferences
            </Link>
          </div>
        </div>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-sm">Unread: {inbox?.unreadCount || 0}</div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-sm">Events: {events.length}</div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-sm">Digests: {digests.length}</div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-sm">Delivery is truth-state based</div>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Inbox</h2>
          {events.length === 0 ? (
            <NotificationEmptyState title="No alerts" message="Generate a test event or wait for signal-triggered events." />
          ) : (
            <div className="space-y-3">
              {events.map((event: any) => (
                <NotificationCard key={event._id} event={event} onRead={markRead} onArchive={archive} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Digests</h2>
          {digests.length === 0 ? (
            <NotificationEmptyState title="No digests" message="Digest records will appear based on schedule and preferences." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {digests.map((digest) => (
                <NotificationDigestCard key={digest._id} digest={digest} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
