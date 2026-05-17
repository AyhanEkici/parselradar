import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import NotificationPreferenceToggle from '../components/notifications/NotificationPreferenceToggle';
import NotificationChannelStatusCard from '../components/notifications/NotificationChannelStatusCard';

export default function NotificationPreferences() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const payload = await apiFetch('notifications/preferences');
      setData(payload);
    } catch (err: any) {
      setError(err?.error || 'Preferences yüklenemedi');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (patch: Record<string, unknown>) => {
    await apiFetch('notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    await load();
  };

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">Yükleniyor...</div>;

  const pref = data.preferences || {};

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Notification Preferences</h1>
          <Link to="/notifications" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-white">
            Back to Inbox
          </Link>
        </div>

        <div className="grid gap-2">
          <NotificationPreferenceToggle
            label="In-App Notifications"
            checked={Boolean(pref.inAppEnabled)}
            onChange={(value) => update({ inAppEnabled: value })}
          />
          <NotificationPreferenceToggle
            label="Email Notifications"
            checked={Boolean(pref.emailEnabled)}
            onChange={(value) => update({ emailEnabled: value })}
          />
          <NotificationPreferenceToggle
            label="Digest"
            checked={Boolean(pref.digestEnabled)}
            onChange={(value) => update({ digestEnabled: value })}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Digest Schedule</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {['daily', 'weekly', 'off'].map((schedule) => (
              <button
                key={schedule}
                onClick={() => update({ digestSchedule: schedule })}
                className={
                  pref.digestSchedule === schedule
                    ? 'rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white'
                    : 'rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-50'
                }
              >
                {schedule}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <NotificationChannelStatusCard channel="In-App" status={data.channelStatus?.inApp} />
          <NotificationChannelStatusCard channel="Email" status={data.channelStatus?.email} />
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900">
          Email delivery only transitions to SENT when provider configuration exists. Otherwise delivery records remain explicit (NOT_CONFIGURED/DISABLED/SUPPRESSED).
        </div>
      </div>
    </div>
  );
}
