import React from 'react';

type PasswordResetStatusVariant = 'idle' | 'loading' | 'success' | 'error';

type Props = {
  variant: PasswordResetStatusVariant;
  message?: string;
};

export default function PasswordResetStatus({ variant, message }: Props) {
  if (variant === 'idle') return null;

  const className =
    variant === 'success'
      ? 'border border-green-200 bg-green-50 text-green-800'
      : variant === 'error'
        ? 'border border-red-200 bg-red-50 text-red-800'
        : 'border border-slate-200 bg-slate-50 text-slate-700';

  return <div className={`rounded-lg px-4 py-3 text-sm ${className}`}>{message || ''}</div>;
}
