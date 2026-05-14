import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

interface Report {
  _id: string;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  useEffect(() => {
    apiFetch('reports').then(setReports);
  }, []);
  return (
    <div className="max-w-lg mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Raporlarım</h2>
      <ul className="space-y-2">
        {reports.map(r => (
          <li key={r._id} className="flex justify-between items-center border-b pb-2">
            <span>Rapor: {r._id}</span>
            <a className="bg-blue-600 text-white px-3 py-1 rounded" href={`/reports/${r._id}/download`}>İndir</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
