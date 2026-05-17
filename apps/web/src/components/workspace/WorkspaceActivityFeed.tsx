import React from 'react';

type Props = {
  items: any[];
};

export default function WorkspaceActivityFeed({ items }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">Activity Feed</div>
      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <div className="text-xs text-slate-500">No activity yet</div>
        ) : (
          items.map((item) => (
            <div key={item._id} className="rounded-lg border border-slate-100 p-2 text-xs">
              <div className="font-semibold text-slate-700">{item.action}</div>
              <div className="text-slate-500">{new Date(item.createdAt).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
