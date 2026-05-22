import React, { useState } from 'react';
import { apiFetch } from '../lib/api';

export default function AdminDealPool() {
  const [propertyId, setPropertyId] = useState('');
  const [entryId, setEntryId] = useState('');
  const [sharedWithType, setSharedWithType] = useState('INVESTOR');
  const [sharedWithName, setSharedWithName] = useState('');
  const [sharedWithContact, setSharedWithContact] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const acceptDeal = async () => {
    if (!propertyId.trim()) return;
    setLoading(true);
    setStatus('');
    try {
      await apiFetch(`/admin/deal-pool/${propertyId.trim()}/accept`, { method: 'POST' });
      setStatus('Deal pool accept başarılı.');
    } catch (err) {
      setStatus((err as { error?: string; message?: string }).error || (err as { message?: string }).message || 'Deal pool accept başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const shareDeal = async () => {
    if (!entryId.trim()) return;
    setLoading(true);
    setStatus('');
    try {
      await apiFetch(`/admin/deal-pool/${entryId.trim()}/share`, {
        method: 'POST',
        body: JSON.stringify({
          sharedWithType,
          sharedWithName,
          sharedWithContact,
          sharedFields: ['addressText', 'il', 'ilce', 'status'],
        }),
      });
      setStatus('Deal pool share başarılı.');
    } catch (err) {
      setStatus((err as { error?: string; message?: string }).error || (err as { message?: string }).message || 'Deal pool share başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-xl font-bold">Deal Pool (Admin)</h2>

      <div className="space-y-2 border rounded p-4">
        <div className="text-sm font-semibold">Accept by Property</div>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="propertyId"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading || !propertyId.trim()} onClick={acceptDeal}>
          Accept Deal Pool
        </button>
      </div>

      <div className="space-y-2 border rounded p-4">
        <div className="text-sm font-semibold">Share by Entry</div>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="entryId"
          value={entryId}
          onChange={(e) => setEntryId(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="sharedWithName"
          value={sharedWithName}
          onChange={(e) => setSharedWithName(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="sharedWithContact"
          value={sharedWithContact}
          onChange={(e) => setSharedWithContact(e.target.value)}
        />
        <select className="w-full border rounded px-3 py-2" value={sharedWithType} onChange={(e) => setSharedWithType(e.target.value)}>
          <option value="INVESTOR">INVESTOR</option>
          <option value="PARTNER">PARTNER</option>
          <option value="INTERNAL">INTERNAL</option>
        </select>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded" disabled={loading || !entryId.trim()} onClick={shareDeal}>
          Share Deal Pool
        </button>
      </div>

      {status ? <div className="text-sm text-slate-700">{status}</div> : null}
    </div>
  );
}
