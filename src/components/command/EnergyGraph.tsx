import { useMemo } from "react";
import { motion } from "framer-motion";
import type { SeriesPoint } from "@/lib/command-data";

interface EnergyGraphProps {
  data: SeriesPoint[];
}

export function EnergyGraph({ data }: EnergyGraphProps) {
  const pathData = useMemo(() => {
    if (!data.length) return { solar: "", load: "", battery: "" };
    const w = 600;
    const h = 180;
    const maxVal = Math.max(...data.map((d) => Math.max(d.solar, d.load, d.battery / 20)), 2);
    const pad = 8;

    const toPoint = (val: number, i: number) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - (val / maxVal) * (h - pad * 2);
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
      return `${linePath} L ${lastPoint.x},${h - pad} L ${firstPoint.x},${h - pad} Z`;
    };

    return {
      solar: buildPath(data.map((d) => d.solar)),
      solarFill: buildFillPath(data.map((d) => d.solar)),
      load: buildPath(data.map((d) => d.load)),
      loadFill: buildFillPath(data.map((d) => d.load)),
    };
  }, [data]);

  const labels = useMemo(() => {
    if (!data.length) return [];
    return data
      .filter((_, i) => i % 3 === 0 || i === data.length - 1)
      .map((d) => ({
        label: `${d.t.toFixed(0)}h`,
        x: 8 + (data.indexOf(d) / (data.length - 1)) * 584,
      }));
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-[32px] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6b6b80]">
          Power Curve
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <span className="text-[9px] font-medium uppercase tracking-wider text-[#6b6b80]">
              Solar
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
            <span className="text-[9px] font-medium uppercase tracking-wider text-[#6b6b80]">
              Load
            </span>
          </div>
        </div>
      </div>

      <div className="relative w-full" style={{ aspectRatio: "600/200" }}>
        <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="solar-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="load-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
            <filter id="glow-solar">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-load">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1="8"
              y1={20 + i * 42}
              x2="592"
              y2={20 + i * 42}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.5"
            />
          ))}

          {/* Solar fill */}
          <path d={pathData.solarFill} fill="url(#solar-grad)" />

          {/* Load fill */}
          <path d={pathData.loadFill} fill="url(#load-grad)" />

          {/* Solar line */}
          <path
            d={pathData.solar}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-solar)"
          />

          {/* Load line */}
          <path
            d={pathData.load}
            fill="none"
            stroke="#a855f7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-load)"
          />

          {/* X-axis labels */}
          {labels.map((l, i) => (
            <text
              key={i}
              x={l.x}
              y="192"
              textAnchor="middle"
              fill="#6b6b80"
              fontSize="8"
              fontFamily="Inter, sans-serif"
              fontWeight="500"
            >
              {l.label}
            </text>
          ))}
        </svg>
      </div>
    </motion.div>
  );
}
