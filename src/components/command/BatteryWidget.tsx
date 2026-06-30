import { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface BatteryWidgetProps {
  batteryPct: number;
  isCharging: boolean;
  batteryNetW: number;
  todayKwh: number;
  runtimeHours: number;
}

export function BatteryWidget({ batteryPct, isCharging, batteryNetW, todayKwh, runtimeHours }: BatteryWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const batteryColor = useMemo(() => {
    if (batteryPct > 60) return "var(--status-online)";
    if (batteryPct > 30) return "var(--status-warning)";
    return "var(--status-error)";
  }, [batteryPct]);

  const statusLabel = useMemo(() => {
    if (isCharging) return "Charging";
    if (batteryPct > 80) return "Full";
    if (batteryPct > 30) return "Discharging";
    return "Low Battery";
  }, [isCharging, batteryPct]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="glass rounded-3xl p-5 flex flex-col items-center"
      style={{ boxShadow: `0 0 40px color-mix(in srgb, ${batteryColor} 8%, transparent), 0 8px 32px rgba(0,0,0,0.5)` }}
    >
      <div className="w-full flex items-center justify-between mb-4">
        <h3 className="label-xs">Battery Reserve</h3>
        <div className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{ backgroundColor: `color-mix(in srgb, ${batteryColor} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${batteryColor} 18%, transparent)`, color: batteryColor }}>
          {statusLabel}
        </div>
      </div>

      <div className="relative w-24 h-48 mb-5">
        <svg viewBox="0 0 96 192" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="glass-body" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="15%" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.04)" />
              <stop offset="85%" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
            </linearGradient>
            <linearGradient id="liquid-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={batteryColor} stopOpacity="0.9" />
              <stop offset="50%" stopColor={batteryPct > 60 ? "var(--status-info)" : batteryColor} stopOpacity="0.65" />
              <stop offset="100%" stopColor={batteryColor} stopOpacity="1" />
            </linearGradient>
            <filter id="battery-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect x="8" y="8" width="80" height="176" rx="14" fill="rgba(0,0,0,0.45)" />
          <motion.rect x="10" y={10 + (176 - 4) * (1 - batteryPct / 100)} width="76" height={Math.max(4, (176 - 4) * (batteryPct / 100))} rx="12" fill="url(#liquid-grad)"
            initial={{ y: 10 + 176 }}
            animate={inView ? { y: 10 + (176 - 4) * (1 - batteryPct / 100) } : {}}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <rect x="8" y="8" width="80" height="176" rx="14" fill="none" stroke="url(#glass-body)" strokeWidth="2" />
          <rect x="32" y="2" width="32" height="6" rx="3" fill="rgba(255,255,255,0.12)" />
          <line x1="24" y1="52" x2="72" y2="52" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 3" />
          <line x1="24" y1="96" x2="72" y2="96" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 3" />
          <line x1="24" y1="140" x2="72" y2="140" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 3" />
          <circle cx="38" cy="4" r="1.5" fill="rgba(255,255,255,0.2)" />
          <circle cx="58" cy="4" r="1.5" fill="rgba(255,255,255,0.2)" />
          {isCharging && (
            <g filter="url(#battery-glow)">
              <text x="48" y="104" textAnchor="middle" fill={batteryColor} fontSize="18" fontWeight="900" opacity="0.6">⚡</text>
            </g>
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.span className="text-4xl font-black tabular-nums" style={{ fontFamily: "Inter, sans-serif", color: batteryColor, textShadow: `0 0 30px ${batteryColor}40` }}>
            {batteryPct.toFixed(0)}
          </motion.span>
          <span className="text-xs font-bold mt-6 ml-0.5" style={{ color: batteryColor }}>%</span>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-2">
        <div className="rounded-2xl p-3 text-center" style={{ backgroundColor: `color-mix(in srgb, ${isCharging ? "var(--status-online)" : "var(--status-error)"} 5%, transparent)`, border: `1px solid color-mix(in srgb, ${isCharging ? "var(--status-online)" : "var(--status-error)"} 10%, transparent)` }}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1">Net Power</div>
          <div className="text-base font-black tabular-nums" style={{ color: isCharging ? "var(--status-online)" : "var(--status-error)", textShadow: `0 0 20px ${isCharging ? "var(--status-online)" : "var(--status-error)"}30` }}>
            {isCharging ? "+" : "-"}{batteryNetW}<span className="text-[10px] font-medium text-[var(--text-muted)] ml-1">W</span>
          </div>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ backgroundColor: "color-mix(in srgb, var(--status-info) 5%, transparent)", border: "1px solid color-mix(in srgb, var(--status-info) 10%, transparent)" }}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1">Runtime</div>
          <div className="text-base font-black tabular-nums" style={{ color: "var(--status-info)", textShadow: "0 0 20px rgba(56,189,248,0.3)" }}>
            {runtimeHours > 24 ? "24+" : runtimeHours.toFixed(1)}<span className="text-[10px] font-medium text-[var(--text-muted)] ml-1">hrs</span>
          </div>
        </div>
      </div>

      <div className="w-full mt-2 rounded-2xl p-2.5 flex items-center justify-between" style={{ backgroundColor: "color-mix(in srgb, var(--energy-solar) 5%, transparent)", border: "1px solid color-mix(in srgb, var(--energy-solar) 10%, transparent)" }}>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Today Yield</span>
        <span className="text-sm font-black tabular-nums" style={{ color: "var(--energy-solar)" }}>
          {todayKwh.toFixed(1)} <span className="text-[10px] font-medium text-[var(--text-muted)]">kWh</span>
        </span>
      </div>
    </motion.div>
  );
}
