type PageStatePanelVariant = "loading" | "empty" | "error" | "locked";

interface PageStatePanelProps {
  variant: PageStatePanelVariant;
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

const variantCopy: Record<PageStatePanelVariant, string> = {
  loading: "We are loading the latest workspace state.",
  empty: "There is no data to show yet.",
  error: "Something could not be loaded.",
  locked: "You do not have access to this workspace area.",
};

export function PageStatePanel({
  variant,
  title,
  message,
  actionHref,
  actionLabel,
  secondaryHref,
  secondaryLabel,
}: PageStatePanelProps) {
  return (
    <section
      aria-label={`${variant} state`}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      data-state-panel={variant}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{variantCopy[variant]}</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{message}</p>

      {(actionHref && actionLabel) || (secondaryHref && secondaryLabel) ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {actionHref && actionLabel ? (
            <a
              href={actionHref}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              {actionLabel}
            </a>
          ) : null}

          {secondaryHref && secondaryLabel ? (
            <a
              href={secondaryHref}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {secondaryLabel}
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export default PageStatePanel;
