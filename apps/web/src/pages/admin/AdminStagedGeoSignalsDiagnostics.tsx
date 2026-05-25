import { useEffect, useMemo, useState } from "react";

type Signal = {
  type: string;
  featureType: string;
  name: string;
  distanceKm: number;
  source: string;
  sourceLayer: string;
  sourceId: string;
  sourceLabel: string;
  confidence: string;
  officialVerification: false;
  disclaimer: string;
};

type DiagnosticResponse = {
  phase?: string;
  status?: string;
  signalCount?: number;
  importRunId?: string | number | null;
  endpoint?: {
    route?: string;
    guard?: string;
    productionBlocked?: boolean;
    adminOrDevGuard?: boolean;
  };
  testCoordinate?: {
    lat: number;
    lon: number;
    label: string;
  };
  signals?: Signal[];
  allOfficialVerificationFalse?: boolean;
  labelsDisclaimersPresent?: boolean;
  productionSwapUsed?: boolean;
  productionTablesQueried?: boolean;
  officialVerification?: false;
  detail?: string;
};

const endpoint = "/api/dev/staged-geo-signals";

export default function AdminStagedGeoSignalsDiagnostics() {
  const [data, setData] = useState<DiagnosticResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const isDevMode = import.meta.env.DEV;

  async function loadDiagnostics() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const body = (await response.json()) as DiagnosticResponse;

      if (!response.ok && body.status !== "CONFIG_REQUIRED") {
        throw new Error(body.detail || `Request failed with HTTP ${response.status}`);
      }

      setData(body);
      setLastRefresh(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDiagnostics();
  }, []);

  const signals = useMemo(() => data?.signals ?? [], [data]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Admin / Dev Diagnostics
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                Staged Geodata Signals
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Internal diagnostic view for staged PostGIS geodata signals. This surface is not a public
                product feature and does not represent official tapu, imar, cadastre, zoning, legal,
                investment, or construction verification.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadDiagnostics()}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh diagnostics"}
            </button>
          </div>
        </header>

        {!isDevMode ? (
          <div className="rounded-2xl border border-amber-700/50 bg-amber-950/40 p-5 text-amber-100">
            This page is intended for dev/admin diagnostics. Production exposure must remain blocked.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-700/50 bg-red-950/40 p-5 text-red-100">
            <strong>Diagnostic error:</strong> {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-4">
          <StatusCard label="Status" value={data?.status ?? "UNKNOWN"} />
          <StatusCard label="Signal count" value={String(data?.signalCount ?? 0)} />
          <StatusCard label="Import run" value={String(data?.importRunId ?? "n/a")} />
          <StatusCard label="Guard" value={data?.endpoint?.guard ?? "DEV_ONLY"} />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <FlagCard label="Official verification false" value={Boolean(data?.allOfficialVerificationFalse)} />
          <FlagCard label="Production tables queried" value={Boolean(data?.productionTablesQueried)} invert />
          <FlagCard label="Production swap used" value={Boolean(data?.productionSwapUsed)} invert />
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-white">Signals</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-900 text-slate-300">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Distance km</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Official?</th>
                </tr>
              </thead>
              <tbody>
                {signals.length === 0 ? (
                  <tr>
                    <td className="px-4 py-5 text-slate-400" colSpan={5}>
                      No staged signals returned yet.
                    </td>
                  </tr>
                ) : (
                  signals.map((signal) => (
                    <tr key={`${signal.type}-${signal.sourceId}`} className="border-t border-slate-800">
                      <td className="px-4 py-3 font-medium text-cyan-200">{signal.type}</td>
                      <td className="px-4 py-3 text-slate-100">{signal.name}</td>
                      <td className="px-4 py-3 text-slate-200">{signal.distanceKm}</td>
                      <td className="px-4 py-3 text-slate-300">{signal.sourceLabel}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {signal.officialVerification ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-white">Boundary statement</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            These are staged public-source POC signals only. They are not official tapu, imar, cadastre,
            zoning, legal, investment, or construction verification. Production swap remains blocked.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Last refresh: {lastRefresh ?? "not loaded"}
          </p>
        </section>
      </section>
    </main>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function FlagCard({ label, value, invert = false }: { label: string; value: boolean; invert?: boolean }) {
  const good = invert ? !value : value;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className={good ? "mt-2 text-xl font-semibold text-emerald-300" : "mt-2 text-xl font-semibold text-red-300"}>
        {String(value)}
      </p>
    </div>
  );
}
