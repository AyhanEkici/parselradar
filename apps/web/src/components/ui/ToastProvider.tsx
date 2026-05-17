import React, { createContext, useCallback, useMemo, useState } from 'react';
import { ToastItem, ToastVariant, ToastViewport } from './ToastViewport';

type ToastApi = {
  success: (message: string) => string;
  error: (message: string) => string;
  loading: (message: string) => string;
  dismiss: (id: string) => void;
  update: (id: string, patch: Partial<Pick<ToastItem, 'message' | 'variant'>>) => void;
};

export const ToastContext = createContext<ToastApi | null>(null);

const SUCCESS_DURATION_MS = 2600;
const ERROR_DURATION_MS = 4200;

function randomId() {
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider({ children }: React.PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (variant: ToastVariant, message: string, autoDismissMs?: number) => {
      const id = randomId();
      setToasts((prev) => [...prev, { id, variant, message }]);

      if (typeof autoDismissMs === 'number' && autoDismissMs > 0) {
        window.setTimeout(() => {
          dismiss(id);
        }, autoDismissMs);
      }

      return id;
    },
    [dismiss],
  );

  const update = useCallback((id: string, patch: Partial<Pick<ToastItem, 'message' | 'variant'>>) => {
    setToasts((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return { ...t, ...patch };
      }),
    );
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message: string) => pushToast('success', message, SUCCESS_DURATION_MS),
      error: (message: string) => pushToast('error', message, ERROR_DURATION_MS),
      loading: (message: string) => pushToast('loading', message),
      dismiss,
      update,
    }),
    [dismiss, pushToast, update],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
