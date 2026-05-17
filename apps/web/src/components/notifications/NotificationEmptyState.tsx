import React from 'react';

type Props = {
  title?: string;
  message?: string;
};

export default function NotificationEmptyState({
  title = 'No notifications',
  message = 'You are all caught up.',
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{message}</div>
    </div>
  );
}
