import React from 'react';

type Props = {
  event: any;
  onRead: (id: string) => void;
  onArchive: (id: string) => void;
};

export default function NotificationCard({ event, onRead, onArchive }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{event.title}</div>
          <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{event.type}</div>
          <div className="mt-2 text-sm text-slate-700">{event.message}</div>
          <div className="mt-2 text-xs text-slate-500">{new Date(event.createdAt).toLocaleString()}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(event.deliveries || []).map((delivery: any) => (
              <span key={delivery._id} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                {delivery.channel}: {delivery.state}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onRead(String(event._id))}
            disabled={Boolean(event.readAt)}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            {event.readAt ? 'Read' : 'Mark Read'}
          </button>
          <button
            onClick={() => onArchive(String(event._id))}
            className="rounded-md border border-amber-300 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}
