import React from 'react';

export type ToastVariant = 'success' | 'error' | 'loading';

export type ToastItem = {
  id: string;
  variant: ToastVariant;
  message: string;
};

type ToastViewportProps = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

function variantClass(variant: ToastVariant) {
  if (variant === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (variant === 'error') return 'border-red-200 bg-red-50 text-red-800';
  return 'border-sky-200 bg-sky-50 text-sky-800';
}

function variantIcon(variant: ToastVariant) {
  if (variant === 'success') return '✓';
  if (variant === 'error') return '✕';
  return '...';
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-lg border px-3 py-2 shadow-sm backdrop-blur-sm ${variantClass(toast.variant)}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-xs font-bold">{variantIcon(toast.variant)}</span>
            <div className="min-w-0 flex-1 text-sm font-medium break-words">{toast.message}</div>
            {toast.variant !== 'loading' ? (
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="rounded px-1 text-xs opacity-70 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
