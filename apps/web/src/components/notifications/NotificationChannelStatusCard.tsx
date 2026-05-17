import React from 'react';

type Props = {
  channel: string;
  status: any;
};

export default function NotificationChannelStatusCard({ channel, status }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{channel}</div>
      <div className="mt-1 text-xs text-slate-600">Configured: {status?.configured ? 'Yes' : 'No'}</div>
      <div className="mt-1 text-xs text-slate-600">State: {status?.state || '-'}</div>
      {status?.provider ? <div className="mt-1 text-xs text-slate-600">Provider: {status.provider}</div> : null}
    </div>
  );
}
