import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SeriesPoint } from "@/lib/command-data";

interface EnergyGraphProps {
  data: SeriesPoint[];
}

export function EnergyGraph({ data }: EnergyGraphProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { w, h, padX, padY, solarPath, solarFill, loadPath, loadFill, maxVal, gridLines, labels, getPoint } = useMemo(() => {
    const w = 600;
    const h = 220;
    const padX = 24;
    const padY = 16;
    const maxVal = Math.max(...data.map(d => Math.max(d.solar, d.load, d.battery / 20)), 2);
    const toPoint = (val: number, i: number) => {
      const x = padX + (i / (data.length - 1)) * (w - padX * 2);
      const y = h - padY - (val / maxVal) * (h - padY * 2);
      return { x, y };
    };
    const buildPath = (vals: number[]) => {
      const pts = vals.map((v, i) => toPoint(v, i));
      if (!pts.length) return "";
      let p = `M ${pts[0].x},${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        p += ` C ${a.x + (b.x - a.x) * 0.4},${a.y} ${a.x + (b.x - a.x) * 0.6},${b.y} ${b.x},${b.y}`;
      }
      return p;
    };
    const buildFill = (vals: number[]) => {
      const line = buildPath(vals);
      const last = toPoint(vals[vals.length - 1], vals.length - 1);
      const first = toPoint(vals[0], 0);
      return `${line} L ${last.x},${h - padY} L ${first.x},${h - padY} Z`;
    };
    const gridLines = Array.from({ length: 5 }).map((_, i) => {
      const val = (maxVal / 4) * i;
      return { val, y: h - padY - (val / maxVal) * (h - padY * 2) };
    });
    const labels = data
      .filter((_, i) => i % 4 === 0 || i === data.length - 1)
      .map(d => ({
        label: `${d.t.toFixed(0).padStart(2, "0")}:00`,
        x: toPoint(0, data.indexOf(d)).x,
      }));
    return {
      w, h, padX, padY,
      solarPath: buildPath(data.map(d => d.solar)),
      solarFill: buildFill(data.map(d => d.solar)),
      loadPath: buildPath(data.map(d => d.load)),
      loadFill: buildFill(data.map(d => d.load)),
      maxVal, gridLines, labels,
      getPoint: toPoint,
    };
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass rounded-3xl p-6 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="label-xs">Power Curve</h3>
        <div className="flex items-center gap-4 bg-[var(--muted)] px-3 py-1.5 rounded-full border border-[var(--border-default)]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--energy-solar)]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">Solar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--energy-load)]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">Load</span>
          </div>
        </div>
      </div>

      <div
        className="relative w-full"
        style={{ aspectRatio: "600/220" }}
        onMouseLeave={() => setHoveredIndex(null)}
        onMouseMove={(e) => {
          if (!data.length) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const xPos = e.clientX - rect.left;
          const pct = Math.max(0, Math.min(1, (xPos - padX * (rect.width / 600)) / (rect.width - padX * 2 * (rect.width / 600))));
          const index = Math.round(pct * (data.length - 1));
          setHoveredIndex(index);
        }}
      >
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="solar-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--energy-solar)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--energy-solar)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="load-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--energy-load)" stopOpacity="0.20" />
              <stop offset="100%" stopColor="var(--energy-load)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines.map((line, i) => (
            <g key={i}>
              <line x1={padX} y1={line.y} x2={w - padX} y2={line.y} stroke="var(--border-default)" strokeWidth="1" strokeDasharray="4 4" />
              <text x={padX - 4} y={line.y + 3} textAnchor="end" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-sans)" fontWeight="600">{line.val > 0 ? line.val.toFixed(1) : "0"}</text>
            </g>
          ))}

          <path d={solarFill} fill="url(#solar-grad)" />
          <path d={loadFill} fill="url(#load-grad)" />
          <path d={loadPath} fill="none" stroke="var(--energy-load)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={solarPath} fill="none" stroke="var(--energy-solar)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {labels.map((l, i) => (
            <text key={i} x={l.x} y={h - 2} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-sans)" fontWeight="600">{l.label}</text>
          ))}

          {hoveredIndex !== null && data[hoveredIndex] && (
            <g>
              <line x1={getPoint(0, hoveredIndex).x} y1={padY} x2={getPoint(0, hoveredIndex).x} y2={h - padY} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx={getPoint(data[hoveredIndex].load, hoveredIndex).x} cy={getPoint(data[hoveredIndex].load, hoveredIndex).y} r="4" fill="var(--bg-page)" stroke="var(--energy-load)" strokeWidth="2.5" />
              <circle cx={getPoint(data[hoveredIndex].solar, hoveredIndex).x} cy={getPoint(data[hoveredIndex].solar, hoveredIndex).y} r="4" fill="var(--bg-page)" stroke="var(--energy-solar)" strokeWidth="2.5" />
            </g>
          )}
        </svg>

        <AnimatePresence>
          {hoveredIndex !== null && data[hoveredIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute pointer-events-none rounded-2xl p-3 z-20 glass-strong border border-[var(--border-strong)]"
              style={{ left: `max(10px, min(calc(100% - 140px), ${getPoint(0, hoveredIndex).x * (100 / w)}% - 70px))`, top: "10%" }}
            >
              <div className="text-[11px] font-semibold text-[var(--text-muted)] mb-2 text-center">{data[hoveredIndex].t.toFixed(0).padStart(2, "0")}:00</div>
              <div className="grid grid-cols-2 gap-4 text-[13px]">
                <div className="flex flex-col items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--energy-solar)]" />
                  <span className="font-semibold text-[var(--energy-solar)]">{data[hoveredIndex].solar.toFixed(2)}</span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase">kW</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--energy-load)]" />
                  <span className="font-semibold text-[var(--energy-load)]">{data[hoveredIndex].load.toFixed(2)}</span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase">kW</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
