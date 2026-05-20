import React from 'react';

export default function SessionTrustCard({ trust }: { trust?: any }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Session Trust</h3>
      <p className="mt-2 text-xs text-slate-700">Trust: {trust?.sessionTrust || '-'}</p>
      <p className="text-xs text-slate-700">Reason: {trust?.reason || '-'}</p>
    </div>
  );
}
