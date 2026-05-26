import React from 'react';

type WithClassName = {
  className?: string;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ');
}

export function AdminPage({ className, children }: React.PropsWithChildren<WithClassName>) {
  return <div className={cx('max-w-6xl mx-auto p-4 sm:p-6', className)}>{children}</div>;
}

export function AdminSurface({ className, children }: React.PropsWithChildren<WithClassName>) {
  return <section className={cx('bg-white border border-slate-200 rounded-lg shadow-sm', className)}>{children}</section>;
}

type AdminHeaderProps = WithClassName & {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
};

export function AdminHeader({ className, title, subtitle, actions }: AdminHeaderProps) {
  return (
    <header className={cx('flex flex-wrap items-start justify-between gap-3', className)}>
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function AdminToolbar({ className, children }: React.PropsWithChildren<WithClassName>) {
  return <div className={cx('flex flex-wrap items-center gap-2', className)}>{children}</div>;
}

type AdminButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
};

export function AdminButton({ className, variant = 'secondary', type = 'button', ...props }: AdminButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
      : variant === 'danger'
      ? 'bg-red-600 text-white border-red-600 hover:bg-red-500'
      : variant === 'ghost'
      ? 'bg-transparent text-slate-700 border-transparent hover:bg-slate-100'
      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50';

  return (
    <button
      type={type}
      className={cx(
        'h-9 px-3 rounded-md border text-sm font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClass,
        className
      )}
      {...props}
    />
  );
}

type AdminInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function AdminInput({ className, ...props }: AdminInputProps) {
  return (
    <input
      className={cx(
        'h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm',
        'P2_1C_TRIAGED_BACKLOG:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400',
        className
      )}
      {...props}
    />
  );
}

type AdminSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function AdminSelect({ className, children, ...props }: React.PropsWithChildren<AdminSelectProps>) {
  return (
    <select
      className={cx(
        'h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

type AdminStatusPillProps = WithClassName & {
  tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'info';
  children: React.ReactNode;
};

export function AdminStatusPill({ className, tone = 'neutral', children }: AdminStatusPillProps) {
  const toneClass =
    tone === 'success'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : tone === 'danger'
      ? 'bg-red-50 text-red-700 border-red-200'
      : tone === 'warning'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : tone === 'info'
      ? 'bg-sky-50 text-sky-700 border-sky-200'
      : 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={cx('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', toneClass, className)}>
      {children}
    </span>
  );
}

export function AdminTableWrap({ className, children }: React.PropsWithChildren<WithClassName>) {
  return <div className={cx('w-full overflow-x-auto border border-slate-200 rounded-lg', className)}>{children}</div>;
}

export function AdminTable({ className, children }: React.PropsWithChildren<WithClassName>) {
  return <table className={cx('min-w-full text-sm', className)}>{children}</table>;
}

export function AdminTh({ className, children }: React.PropsWithChildren<WithClassName>) {
  return <th className={cx('px-3 py-2 text-left font-semibold text-slate-700 border-b border-slate-200 bg-slate-50', className)}>{children}</th>;
}

export function AdminTd({ className, children }: React.PropsWithChildren<WithClassName>) {
  return <td className={cx('px-3 py-2 align-top text-slate-800 border-b border-slate-100', className)}>{children}</td>;
}

type AdminEmptyStateProps = WithClassName & {
  children: React.ReactNode;
};

export function AdminEmptyState({ className, children }: AdminEmptyStateProps) {
  return <div className={cx('rounded-md border border-dashed border-slate-300 p-6 text-sm text-slate-600 text-center', className)}>{children}</div>;
}
