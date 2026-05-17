import React from 'react';

type Props = { digest: any };

export default function NotificationDigestCard({ digest }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{digest.schedule?.toUpperCase?.() || 'DIGEST'}</div>
      <div className="mt-1 text-xs text-slate-600">Items: {digest.itemCount || 0}</div>
      <div className="mt-1 text-xs text-slate-600">Delivery: {digest.deliveryState || '-'}</div>
      <div className="mt-1 text-xs text-slate-600">Created: {new Date(digest.createdAt).toLocaleString()}</div>
    </div>
  );
}
