"use client";
// Gráficos SVG ligeros y accesibles (cada gráfico expone una tabla de datos equivalente para lectores de pantalla).

interface PuntoLinea { x: string; y: number }

export function GraficoLinea({ puntos, unidad, etiquetaAccesible }: { puntos: PuntoLinea[]; unidad: string; etiquetaAccesible: string }) {
  if (puntos.length === 0) return null;
  const W = 600, H = 220, P = { t: 16, r: 16, b: 28, l: 44 };
  const ys = puntos.map((p) => p.y);
  const min = Math.min(...ys), max = Math.max(...ys);
  const margen = max === min ? Math.max(1, max * 0.1) : (max - min) * 0.15;
  const lo = Math.max(0, min - margen), hi = max + margen;
  const x = (i: number) => P.l + (puntos.length === 1 ? (W - P.l - P.r) / 2 : (i / (puntos.length - 1)) * (W - P.l - P.r));
  const y = (v: number) => P.t + (1 - (v - lo) / (hi - lo || 1)) * (H - P.t - P.b);
  const ruta = puntos.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(" ");
  const marcas = [lo, (lo + hi) / 2, hi];
  const paso = Math.max(1, Math.ceil(puntos.length / 6));
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={etiquetaAccesible} className="w-full h-auto">
        {marcas.map((m) => (
          <g key={m}>
            <line x1={P.l} x2={W - P.r} y1={y(m)} y2={y(m)} stroke="rgba(255,255,255,0.07)" />
            <text x={P.l - 8} y={y(m) + 4} textAnchor="end" fontSize="11" fill="rgba(255,255,255,0.4)">{Math.round(m * 10) / 10}</text>
          </g>
        ))}
        <path d={ruta} fill="none" stroke="#02F5D4" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {puntos.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.y)} r="4" fill="#050505" stroke="#02F5D4" strokeWidth="2" />
            {i % paso === 0 && <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.4)">{p.x}</text>}
          </g>
        ))}
      </svg>
      <figcaption className="sr-only">
        <table>
          <caption>{etiquetaAccesible}</caption>
          <thead><tr><th>Fecha</th><th>Valor ({unidad})</th></tr></thead>
          <tbody>{puntos.map((p, i) => <tr key={i}><td>{p.x}</td><td>{p.y}</td></tr>)}</tbody>
        </table>
      </figcaption>
    </figure>
  );
}

export function GraficoBarras({ datos, etiquetaAccesible }: { datos: { etiqueta: string; valor: number }[]; etiquetaAccesible: string }) {
  const max = Math.max(1, ...datos.map((d) => d.valor));
  return (
    <figure>
      <div role="img" aria-label={etiquetaAccesible} className="flex items-end gap-1.5 sm:gap-2 h-32">
        {datos.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
            <span className="text-[10px] text-white/50 mb-1 tabular-nums">{d.valor || ""}</span>
            <div
              className={d.valor ? "w-full rounded-t-md bg-gradient-to-t from-[#2272FF] to-[#02F5D4]" : "w-full rounded-t-md bg-white/[0.06]"}
              style={{ height: `${Math.max(4, (d.valor / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 sm:gap-2 mt-2" aria-hidden>
        {datos.map((d, i) => <span key={i} className="flex-1 text-center text-[10px] text-white/35 truncate">{d.etiqueta}</span>)}
      </div>
      <figcaption className="sr-only">
        <table>
          <caption>{etiquetaAccesible}</caption>
          <thead><tr><th>Periodo</th><th>Sesiones</th></tr></thead>
          <tbody>{datos.map((d, i) => <tr key={i}><td>{d.etiqueta}</td><td>{d.valor}</td></tr>)}</tbody>
        </table>
      </figcaption>
    </figure>
  );
}
