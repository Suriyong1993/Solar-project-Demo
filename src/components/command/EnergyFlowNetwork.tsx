import { useMemo } from "react";
import { motion } from "framer-motion";

interface EnergyFlowProps {
  solarKw: number;
  batteryPct: number;
  loadKw: number;
  batteryFlowKw: number;
  isCharging: boolean;
  mpptEfficiencyPct?: number | null;
}

type NodeId = "solar" | "mppt" | "battery" | "home" | "grid";

export function EnergyFlowNetwork({ solarKw, batteryPct, loadKw, batteryFlowKw, isCharging, mpptEfficiencyPct }: EnergyFlowProps) {
  const nodes = useMemo(() => [
    { id: "solar" as NodeId, label: "SOLAR ARRAY", x: 50, y: 10, value: `${solarKw.toFixed(1)} kW`, color: "var(--energy-solar)" },
    { id: "mppt" as NodeId, label: "MPPT INVERTER", x: 50, y: 35, value: mpptEfficiencyPct != null && mpptEfficiencyPct > 0 ? `${mpptEfficiencyPct.toFixed(1)}%` : "—", color: "var(--status-info)" },
    { id: "battery" as NodeId, label: "BATTERY BANK", x: 18, y: 65, value: `${batteryPct.toFixed(0)}%`, color: "var(--energy-battery)" },
    { id: "home" as NodeId, label: "HOME LOAD", x: 82, y: 65, value: `${loadKw.toFixed(1)} kW`, color: "var(--energy-load)" },
    { id: "grid" as NodeId, label: "UTILITY GRID", x: 50, y: 90, value: isCharging ? "EXPORTING" : "IMPORTING", color: "var(--text-muted)" },
  ], [solarKw, batteryPct, loadKw, isCharging, mpptEfficiencyPct]);

  const particles = useMemo(() => {
    const result: { id: number; path: string; progress: number; color: string; size: number; speed: number }[] = [];
    let id = 0;
    const s2m = `M ${nodes[0].x}%,${nodes[0].y + 4}% L ${nodes[1].x}%,${nodes[1].y - 4}%`;
    const nSolar = solarKw > 2 ? 5 : solarKw > 0 ? 3 : 0;
    for (let i = 0; i < nSolar; i++) result.push({ id: id++, path: s2m, progress: (i / nSolar) * 100, color: "var(--energy-solar)", size: 2.5 + Math.random(), speed: 1.0 + Math.random() * 0.5 });
    if (isCharging) {
      const m2b = `M ${nodes[1].x - 4}%,${nodes[1].y + 4}% L ${nodes[2].x + 6}%,${nodes[2].y - 4}%`;
      const nBat = Math.abs(batteryFlowKw) > 1 ? 4 : Math.abs(batteryFlowKw) > 0 ? 2 : 0;
      for (let i = 0; i < nBat; i++) result.push({ id: id++, path: m2b, progress: (i / nBat) * 100, color: "var(--energy-battery)", size: 2.5 + Math.random(), speed: 1.2 + Math.random() * 0.4 });
    } else {
      const b2m = `M ${nodes[2].x + 6}%,${nodes[2].y + 4}% L ${nodes[1].x - 4}%,${nodes[1].y + 6}%`;
      const nBat = Math.abs(batteryFlowKw) > 1 ? 4 : Math.abs(batteryFlowKw) > 0 ? 2 : 0;
      for (let i = 0; i < nBat; i++) result.push({ id: id++, path: b2m, progress: (i / nBat) * 100, color: "var(--energy-battery)", size: 2.5 + Math.random(), speed: 1.2 + Math.random() * 0.4 });
    }
    const m2h = `M ${nodes[1].x + 4}%,${nodes[1].y + 4}% L ${nodes[3].x - 6}%,${nodes[3].y - 4}%`;
    const nHome = loadKw > 1.5 ? 4 : loadKw > 0 ? 2 : 0;
    for (let i = 0; i < nHome; i++) result.push({ id: id++, path: m2h, progress: (i / nHome) * 100, color: "var(--energy-load)", size: 2.5 + Math.random(), speed: 1.0 + Math.random() * 0.4 });
    const g2m = isCharging ? `M ${nodes[4].x - 6}%,${nodes[4].y - 4}% L ${nodes[1].x - 4}%,${nodes[1].y + 6}%` : `M ${nodes[1].x - 4}%,${nodes[1].y + 6}% L ${nodes[4].x - 6}%,${nodes[4].y - 4}%`;
    const nGrid = isCharging ? 0 : 2;
    for (let i = 0; i < nGrid; i++) result.push({ id: id++, path: g2m, progress: (i / nGrid) * 100, color: "var(--text-muted)", size: 2, speed: 1.0 });
    return result;
  }, [nodes, solarKw, batteryFlowKw, isCharging, loadKw]);

  return (
    <div className="w-full h-full relative" style={{ aspectRatio: "16/9" }}>
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="solar-grad-efn" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--energy-solar)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--status-info)" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="battery-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--status-info)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--energy-battery)" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="home-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--status-info)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--energy-load)" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="grid-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--status-info)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--text-muted)" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="100" height="100" fill="transparent" />

        {/* Connection lines */}
        <path d={`M ${nodes[0].x}%,${nodes[0].y + 4}% L ${nodes[1].x}%,${nodes[1].y - 4}%`} fill="none" stroke="url(#solar-grad-efn)" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" />
        <path d={`M ${nodes[1].x + 4}%,${nodes[1].y + 4}% L ${nodes[3].x - 6}%,${nodes[3].y - 4}%`} fill="none" stroke="url(#home-grad)" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" />
        <path d={isCharging ? `M ${nodes[1].x - 4}%,${nodes[1].y + 4}% L ${nodes[2].x + 6}%,${nodes[2].y - 4}%` : `M ${nodes[2].x + 6}%,${nodes[2].y + 4}% L ${nodes[1].x - 4}%,${nodes[1].y + 6}%`} fill="none" stroke="url(#battery-grad)" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" />
        <path d={isCharging ? `M ${nodes[4].x - 6}%,${nodes[4].y - 4}% L ${nodes[1].x - 4}%,${nodes[1].y + 6}%` : `M ${nodes[1].x - 4}%,${nodes[1].y + 6}% L ${nodes[4].x - 6}%,${nodes[4].y - 4}%`} fill="none" stroke="url(#grid-grad)" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" />

        {/* Particles */}
        {particles.map((p) => (
          <motion.circle
            key={p.id}
            r={p.size}
            fill={p.color}
            opacity={0.8}
            style={{ filter: "blur(0.5px)" }}
          >
            <motion.animateMotion
              dur={`${8 / p.speed}s`}
              repeatCount="indefinite"
              path={p.path}
              begin={`-${(p.progress / 100) * (8 / p.speed)}s`}
            />
          </motion.circle>
        ))}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle cx={`${node.x}%`} cy={`${node.y}%`} r="4" fill="var(--bg-page)" stroke={node.color} strokeWidth="1.5" opacity="0.9" />
            <circle cx={`${node.x}%`} cy={`${node.y}%`} r="2.5" fill={node.color} opacity="0.6" />
            <text x={`${node.x}%`} y={`${node.y - 7}%`} textAnchor="middle" fill={node.color} fontSize="2.8" fontWeight="800" fontFamily="var(--font-sans)" letterSpacing="0.8">{node.label}</text>
            <text x={`${node.x}%`} y={`${node.y + 8}%`} textAnchor="middle" fill={node.color} fontSize="4.5" fontWeight="900" fontFamily="var(--font-sans)">{node.value}</text>
          </g>
        ))}

        {/* Flow labels on lines */}
        <motion.g animate={{ y: [0, -1, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <rect x={`${nodes[0].x - 6}%`} y={`${(nodes[0].y + nodes[1].y) / 2 - 2}%`} width="12" height="4" rx="2" fill="var(--bg-page)" stroke="color-mix(in srgb, var(--energy-solar) 30%, transparent)" strokeWidth="0.5" />
          <text x={`${nodes[0].x}%`} y={`${(nodes[0].y + nodes[1].y) / 2 + 0.8}%`} textAnchor="middle" fill="var(--energy-solar)" fontSize="2.8" fontWeight="800" fontFamily="var(--font-sans)">{solarKw.toFixed(1)} kW ↓</text>
        </motion.g>

        <motion.g animate={{ x: [0, 1, 0] }} transition={{ duration: 3.5, repeat: Infinity }}>
          <rect x={`${(nodes[1].x + nodes[3].x) / 2 - 6}%`} y={`${(nodes[1].y + nodes[3].y) / 2 - 2}%`} width="12" height="4" rx="2" fill="var(--bg-page)" stroke="color-mix(in srgb, var(--energy-load) 30%, transparent)" strokeWidth="0.5" />
          <text x={`${(nodes[1].x + nodes[3].x) / 2}%`} y={`${(nodes[1].y + nodes[3].y) / 2 + 0.8}%`} textAnchor="middle" fill="var(--energy-load)" fontSize="2.8" fontWeight="800" fontFamily="var(--font-sans)">{loadKw.toFixed(1)} kW →</text>
        </motion.g>

        {isCharging ? (
          <motion.g animate={{ x: [-1, 1, -1] }} transition={{ duration: 3, repeat: Infinity }}>
            <rect x={`${(nodes[1].x + nodes[2].x) / 2 - 6}%`} y={`${(nodes[1].y + nodes[2].y) / 2 - 2}%`} width="12" height="4" rx="2" fill="var(--bg-page)" stroke="color-mix(in srgb, var(--energy-battery) 30%, transparent)" strokeWidth="0.5" />
            <text x={`${(nodes[1].x + nodes[2].x) / 2}%`} y={`${(nodes[1].y + nodes[2].y) / 2 + 0.8}%`} textAnchor="middle" fill="var(--energy-battery)" fontSize="2.8" fontWeight="800" fontFamily="var(--font-sans)">← {Math.abs(batteryFlowKw).toFixed(1)} kW</text>
          </motion.g>
        ) : (
          <motion.g animate={{ x: [-1, 1, -1] }} transition={{ duration: 3, repeat: Infinity }}>
            <rect x={`${(nodes[1].x + nodes[2].x) / 2 - 6}%`} y={`${(nodes[1].y + nodes[2].y) / 2 - 2}%`} width="12" height="4" rx="2" fill="var(--bg-page)" stroke="color-mix(in srgb, var(--energy-battery) 30%, transparent)" strokeWidth="0.5" />
            <text x={`${(nodes[1].x + nodes[2].x) / 2}%`} y={`${(nodes[1].y + nodes[2].y) / 2 + 0.8}%`} textAnchor="middle" fill="var(--energy-battery)" fontSize="2.8" fontWeight="800" fontFamily="var(--font-sans)">{Math.abs(batteryFlowKw).toFixed(1)} kW →</text>
          </motion.g>
        )}
      </svg>
    </div>
  );
}
