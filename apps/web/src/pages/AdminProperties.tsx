import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { Link } from 'react-router-dom';

interface Property {
  _id: string;
  addressText: string;
  il: string;
  ilce: string;
}

export default function AdminProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  useEffect(() => {
    apiFetch('admin/properties').then(setProperties);
  }, []);
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Tüm Mülkler (Admin)</h2>
      <ul className="space-y-2">
        {properties.map(p => (
          <li key={p._id}>
            <Link
              to={`/admin/properties/${p._id}`}
              className="block border rounded p-3 hover:bg-gray-50 transition"
              title={`Mülkü aç: ${p.addressText || p._id}`}
            >
              <div className="font-medium">{p.addressText || 'Adres girilmemiş'}</div>
              <div className="text-sm text-gray-600">{p.il} / {p.ilce}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
