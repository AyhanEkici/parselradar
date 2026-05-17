import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { Link } from 'react-router-dom';
import {
  AdminButton,
  AdminEmptyState,
  AdminHeader,
  AdminInput,
  AdminLayout,
  AdminPage,
  AdminStatusPill,
  AdminSurface,
  AdminToolbar,
} from '../components/admin';

interface Property {
  _id: string;
  addressText?: string;
  il?: string;
  ilce?: string;
  status?: string;
  listingPrice?: number;
  price?: number;
  areaM2?: number;
  netAreaM2?: number;
  grossAreaM2?: number;
  ownerName?: string;
  ownerUserId?: string;
  userId?:
    | string
    | {
        _id?: string;
        name?: string;
        email?: string;
      };
}

function formatMoney(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(value);
}

function statusTone(status?: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const normalized = (status || '').toUpperCase();
  if (normalized === 'APPROVED' || normalized === 'COMPLETED' || normalized === 'ACTIVE') return 'success';
  if (normalized === 'PENDING' || normalized === 'DRAFT') return 'warning';
  if (normalized === 'REJECTED' || normalized === 'CANCELED' || normalized === 'ARCHIVED') return 'danger';
  if (normalized) return 'info';
  return 'neutral';
}

function shortenId(value?: string) {
  if (!value) return '-';
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function resolveUserDisplay(property: Property) {
  const user = property.userId;
  if (typeof user === 'string') return shortenId(user);
  if (user?.name || user?.email) return `${user.name || user.email}${user.email && user.name ? ` (${user.email})` : ''}`;
  if (user?._id) return shortenId(user._id);
  if (property.ownerName) return property.ownerName;
  if (property.ownerUserId) return shortenId(property.ownerUserId);
  return '-';
}

export default function AdminProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    apiFetch('admin/properties').then(setProperties);
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = properties.filter((property) => {
    if (!normalizedQuery) return true;
    const haystack = [
      property.addressText,
      property.il,
      property.ilce,
      property.status,
      property.ownerName,
      property.ownerUserId,
      typeof property.userId === 'string' ? property.userId : property.userId?.name,
      typeof property.userId === 'string' ? '' : property.userId?.email,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  return (
    <AdminLayout title="Properties">
      <AdminPage className="p-0 sm:p-0">
        <AdminSurface className="p-4 sm:p-5 space-y-4">
        <AdminHeader
          title="Tüm Mülkler"
          subtitle="Mülkleri durum, lokasyon ve temel metrikleriyle inceleyin"
        />

        <AdminToolbar className="justify-between">
          <AdminInput
            className="w-full sm:w-80"
            placeholder="Adres, şehir, ilçe, durum, kullanıcı ara"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">{filtered.length} kayıt</span>
            <AdminButton onClick={() => setQuery('')} disabled={!query}>
              Temizle
            </AdminButton>
          </div>
        </AdminToolbar>

        {filtered.length === 0 ? (
          <AdminEmptyState>
            Görüntülenecek mülk bulunamadı. Filtreyi temizleyip tekrar deneyin.
          </AdminEmptyState>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((p) => {
              const price = typeof p.listingPrice === 'number' ? p.listingPrice : p.price;
              const area = typeof p.areaM2 === 'number'
                ? p.areaM2
                : typeof p.netAreaM2 === 'number'
                ? p.netAreaM2
                : p.grossAreaM2;

              return (
                <li key={p._id}>
                  <Link
                    to={`/admin/properties/${p._id}`}
                    className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition"
                    title={`Mülkü aç: ${p.addressText || p._id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 break-words">
                          {p.addressText || 'Adres girilmemiş'}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          {p.il || '-'} / {p.ilce || '-'}
                        </div>
                      </div>
                      <AdminStatusPill tone={statusTone(p.status)}>{p.status || 'UNKNOWN'}</AdminStatusPill>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
                        <div className="text-xs text-slate-500">Fiyat</div>
                        <div className="font-semibold text-slate-800">{formatMoney(price)}</div>
                      </div>
                      <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
                        <div className="text-xs text-slate-500">Alan (m²)</div>
                        <div className="font-semibold text-slate-800">{typeof area === 'number' ? area : '-'}</div>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-slate-700">
                      <span className="text-slate-500">Kullanıcı:</span> {resolveUserDisplay(p)}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        </AdminSurface>
      </AdminPage>
    </AdminLayout>
  );
}
