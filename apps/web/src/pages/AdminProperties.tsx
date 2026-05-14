import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

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
    <div className="max-w-lg mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Tüm Mülkler (Admin)</h2>
      <ul className="space-y-2">
        {properties.map(p => (
          <li key={p._id} className="border-b pb-2">{p.addressText} - {p.il} / {p.ilce}</li>
        ))}
      </ul>
    </div>
  );
}
