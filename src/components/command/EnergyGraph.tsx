import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { SeriesPoint } from "@/lib/command-data";

interface EnergyGraphProps {
  data: SeriesPoint[];
}

export function EnergyGraph({ data }: EnergyGraphProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const pathData = useMemo(() => {
    if (!data.length) return { solar: "", load: "", battery: "" };
    const w = 600;
    const h = 220; // Increased height
    const maxVal = Math.max(...data.map((d) => Math.max(d.solar, d.load, d.battery / 20)), 2);
    const padX = 24;
    const padY = 16;

    const toPoint = (val: number, i: number) => {
      const x = padX + (i / (data.length - 1)) * (w - padX * 2);
      const y = h - padY - (val / maxVal) * (h - padY * 2);
      return { x, y };
    };

    const buildPath = (values: number[]) => {
      const points = values.map((v, i) => toPoint(v, i));
      if (points.length === 0) return "";
      let path = `M ${points[0].x},${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
        const cpx2 = prev.x + (curr.x - prev.x) * 0.6;
        path += ` C ${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`;
      }
      return path;
    };

    const buildFillPath = (values: number[]) => {
      const linePath = buildPath(values);
      const lastPoint = toPoint(values[values.length - 1], values.length - 1);
      const firstPoint = toPoint(values[0], 0);
      return `${linePath} L ${lastPoint.x},${h - padY} L ${firstPoint.x},${h - padY} Z`;
    };

    return {
      solar: buildPath(data.map((d) => d.solar)),
      solarFill: buildFillPath(data.map((d) => d.solar)),
      load: buildPath(data.map((d) => d.load)),
      loadFill: buildFillPath(data.map((d) => d.load)),
      getPoint: toPoint,
      maxVal,
      w,
      h,
      padX,
      padY
    };
  }, [data]);

  const labels = useMemo(() => {
    if (!data.length) return [];
    return data
      .filter((_, i) => i % 4 === 0 || i === data.length - 1)
      .map((d) => ({
        label: `${d.t.toFixed(0).padStart(2, '0')}:00`,
        x: pathData.getPoint(0, data.indexOf(d)).x,
      }));
  }, [data, pathData]);

  // Y-axis grid lines
  const gridLines = useMemo(() => {
    if (!pathData.maxVal) return [];
    const steps = 4;
    return Array.from({ length: steps + 1 }).map((_, i) => {
      const val = (pathData.maxVal / steps) * i;
      return {
        val,
        y: pathData.h - pathData.padY - (val / pathData.maxVal) * (pathData.h - pathData.padY * 2)
      };
    });
  }, [pathData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass rounded-[32px] p-6 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#e8e8f0]">
          Power Curve
        </h3>
        <div className="flex items-center gap-4 bg-white/[0.02] px-3 py-1.5 rounded-full border border-white/[0.05]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#e8e8f0]">
              Solar
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#e8e8f0]">
              Load
            </span>
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
          const pct = Math.max(0, Math.min(1, (xPos - pathData.padX * (rect.width / 600)) / (rect.width - pathData.padX * 2 * (rect.width / 600))));
          const index = Math.round(pct * (data.length - 1));
          setHoveredIndex(index);
        }}
      >
        <svg viewBox={`0 0 ${pathData.w || 600} ${pathData.h || 220}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="solar-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="load-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
            <filter id="glow-solar" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-load" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {gridLines.map((line, i) => (
            <g key={i}>
              <line
                x1={pathData.padX}
                y1={line.y}
                x2={pathData.w - pathData.padX}
                y2={line.y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={pathData.padX - 4}
                y={line.y + 3}
                textAnchor="end"
                fill="#6b6b80"
                fontSize="9"
                fontFamily="Inter, sans-serif"
                fontWeight="600"
              >
                {line.val > 0 ? line.val.toFixed(1) : "0"}
              </text>
            </g>
          ))}

          {/* Solar fill */}
          <path d={pathData.solarFill} fill="url(#solar-grad)" />

          {/* Load fill */}
          <path d={pathData.loadFill} fill="url(#load-grad)" />

          {/* Load line */}
          <path
            d={pathData.load}
            fill="none"
            stroke="#a855f7"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-load)"
          />
          
          {/* Solar line */}
          <path
            d={pathData.solar}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-solar)"
          />

          {/* X-axis labels */}
          {labels.map((l, i) => (
            <text
              key={i}
              x={l.x}
              y={pathData.h - 2}
              textAnchor="middle"
              fill="#8e8ea0"
              fontSize="10"
              fontFamily="Inter, sans-serif"
              fontWeight="600"
            >
              {l.label}
            </text>
          ))}

          {/* Interactive Hover Indicator */}
          {hoveredIndex !== null && data[hoveredIndex] && (
            <g>
              <line
                x1={pathData.getPoint(0, hoveredIndex).x}
                y1={pathData.padY}
                x2={pathData.getPoint(0, hoveredIndex).x}
                y2={pathData.h - pathData.padY}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              
              {/* Data points */}
              <circle
                cx={pathData.getPoint(data[hoveredIndex].load, hoveredIndex).x}
                cy={pathData.getPoint(data[hoveredIndex].load, hoveredIndex).y}
                r="4"
                fill="#07090f"
                stroke="#a855f7"
                strokeWidth="2.5"
              />
              <circle
                cx={pathData.getPoint(data[hoveredIndex].solar, hoveredIndex).x}
                cy={pathData.getPoint(data[hoveredIndex].solar, hoveredIndex).y}
                r="4"
                fill="#07090f"
                stroke="#f59e0b"
                strokeWidth="2.5"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredIndex !== null && data[hoveredIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute pointer-events-none rounded-[16px] p-3 z-20"
              style={{
                left: `max(10px, min(calc(100% - 130px), ${pathData.getPoint(0, hoveredIndex).x * (100 / (pathData.w || 600))}% - 60px))`,
                top: "10%",
                background: "rgba(11, 13, 22, 0.8)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div className="text-[10px] font-semibold text-[#8e8ea0] mb-2 text-center">
                {data[hoveredIndex].t.toFixed(0).padStart(2, '0')}:00
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold uppercase text-[#f59e0b]">Solar</span>
                  <span className="text-sm font-black text-white tabular-nums">{data[hoveredIndex].solar.toFixed(1)}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold uppercase text-[#a855f7]">Load</span>
                  <span className="text-sm font-black text-white tabular-nums">{data[hoveredIndex].load.toFixed(1)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
