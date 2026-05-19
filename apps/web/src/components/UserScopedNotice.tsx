import React from 'react';

export default function UserScopedNotice() {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
      Showing only your own submitted properties and reports.
      <div className="mt-1 text-xs text-blue-700">
        Admin users can access pilot/global operational views.
      </div>
    </div>
  );
}
