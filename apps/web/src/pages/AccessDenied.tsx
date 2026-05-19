import React from 'react';
import { Link } from 'react-router-dom';

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto mt-20 max-w-lg rounded-xl border border-red-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-red-700">Access Denied</h1>
        <p className="mt-3 text-sm text-slate-700">
          You do not have permission to access this route.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Normal users can access only their own data surfaces. Admin users can access global operational views.
        </p>
        <div className="mt-5">
          <Link to="/dashboard" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
