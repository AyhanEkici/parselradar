import React, { useMemo } from 'react';
import { GeoLayerRecord } from './types';

type LayerGroupKey = 'municipality' | 'zoning' | 'infrastructure' | 'transport' | 'environmental' | 'investment' | 'other';

const ORDER: LayerGroupKey[] = ['municipality', 'zoning', 'infrastructure', 'transport', 'environmental', 'investment', 'other'];

function classify(layer: GeoLayerRecord): LayerGroupKey {
  const text = `${layer.name} ${layer.title}`.toLowerCase();
  if (/belediye|municipal|district|ilce|mahalle/.test(text)) return 'municipality';
  if (/zon|plan|imar|landuse/.test(text)) return 'zoning';
  if (/utility|water|electric|grid|infra|pipeline|power/.test(text)) return 'infrastructure';
  if (/road|transport|rail|metro|mobility|highway/.test(text)) return 'transport';
  if (/forest|wetland|env|pollution|climate|eco/.test(text)) return 'environmental';
  if (/market|investment|opportunity|value/.test(text)) return 'investment';
  return 'other';
}

export default function LayerGroupPanel({
  layers,
  search,
  onToggle,
  onOpacity,
}: {
  layers: GeoLayerRecord[];
  search: string;
  onToggle: (layerId: string, nextVisible: boolean) => void;
  onOpacity: (layerId: string, opacity: number) => void;
}) {
  const grouped = useMemo(() => {
    const term = search.trim().toLowerCase();
    const initial: Record<LayerGroupKey, GeoLayerRecord[]> = {
      municipality: [],
      zoning: [],
      infrastructure: [],
      transport: [],
      environmental: [],
      investment: [],
      other: [],
    };

    for (const layer of layers) {
      if (term) {
        const probe = `${layer.title} ${layer.name} ${layer.service}`.toLowerCase();
        if (!probe.includes(term)) continue;
      }
      initial[classify(layer)].push(layer);
    }

    return initial;
  }, [layers, search]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <h3 className="text-sm font-semibold text-slate-900">Layer Groups</h3>
      <p className="mt-1 text-xs text-slate-600">Diagnostics-backed group controls for visibility and opacity.</p>
      <div className="mt-3 space-y-3">
        {ORDER.map((group) => (
          <div key={group} className="rounded border border-slate-200 p-2">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-700">{group}</div>
            {grouped[group].length === 0 ? <div className="text-xs text-slate-400">No layers in this group.</div> : null}
            <ul className="space-y-2">
              {grouped[group].map((layer) => (
                <li key={layer.id} className="rounded border border-slate-100 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-medium text-slate-900">{layer.title}</div>
                      <div className="text-[11px] text-slate-500">{layer.service} • {(layer.projection || []).join(', ') || 'projection unknown'}</div>
                    </div>
                    <label className="text-xs text-slate-700">
                      <input type="checkbox" checked={layer.visibility} onChange={(event) => onToggle(layer.id, event.target.checked)} /> visible
                    </label>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">opacity</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={layer.opacity}
                      onChange={(event) => onOpacity(layer.id, Number(event.target.value))}
                      className="w-full"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
