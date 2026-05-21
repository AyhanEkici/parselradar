import React from 'react';

type LayerItem = {
  id: string;
  title: string;
  visibility: boolean;
  opacity: number;
  bbox?: { minx: number; miny: number; maxx: number; maxy: number; crs?: string };
};

function normalizeX(x: number) {
  return ((x + 180) / 360) * 100;
}

function normalizeY(y: number) {
  return (1 - (y + 90) / 180) * 100;
}

export default function ReadOnlyLayerOverlayMap({ layers }: { layers: LayerItem[] }) {
  const visible = layers.filter((layer) => layer.visibility && layer.bbox);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Read-Only Overlay Preview</h3>
      <p className="mt-1 text-xs text-slate-600">Bounding-box render only for layer footprint visibility and projection awareness.</p>
      <div className="mt-3 rounded border border-slate-300 bg-slate-50 p-2">
        <svg viewBox="0 0 100 50" className="h-64 w-full">
          <rect x="0" y="0" width="100" height="50" fill="#f8fafc" stroke="#cbd5e1" />
          {visible.map((layer) => {
            const bbox = layer.bbox!;
            const x1 = normalizeX(bbox.minx);
            const y1 = normalizeY(bbox.maxy) / 2;
            const x2 = normalizeX(bbox.maxx);
            const y2 = normalizeY(bbox.miny) / 2;
            const width = Math.max(0.5, x2 - x1);
            const height = Math.max(0.5, y2 - y1);
            return (
              <g key={layer.id}>
                <rect x={x1} y={y1} width={width} height={height} fill="rgba(59,130,246,0.3)" stroke="#1d4ed8" opacity={layer.opacity} />
                <title>{layer.title}</title>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 text-xs text-slate-600">Visible overlays: {visible.length}</div>
    </div>
  );
}
