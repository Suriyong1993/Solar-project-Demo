import { motion } from "framer-motion";
import { Sun, TrendingUp, TrendingDown } from "lucide-react";

interface HeroMetricProps {
  solarKw: number;
  peakKw: number;
  todayKwh: number;
}

export function HeroMetric({ solarKw, peakKw, todayKwh }: HeroMetricProps) {
  const isActive = solarKw > 0.1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--energy-solar)]/10 border border-[var(--energy-solar)]/20">
              <Sun className="h-4 w-4" style={{ color: "var(--energy-solar)" }} />
            </div>
            <span className="label-xs">Solar Generation</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="value-2xl tabular-nums number-glow-solar" style={{ color: "var(--energy-solar)" }}>
              {solarKw.toFixed(2)}
            </span>
            <span className="unit-sm" style={{ color: "var(--text-muted)" }}>kW</span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-[13px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              {isActive ? (
                <TrendingUp className="h-3.5 w-3.5" style={{ color: "var(--status-online)" }} />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
              )}
              {isActive ? "Generating" : "Standby"}
            </span>
            <span className="text-[var(--border-default)]">|</span>
            <span>Peak: {peakKw.toFixed(2)} kW</span>
            <span className="text-[var(--border-default)]">|</span>
            <span>Yield: {todayKwh.toFixed(1)} kWh</span>
          </div>
        </div>

        <div className="w-full md:w-48 h-20 flex items-end gap-1">
          {Array.from({ length: 12 }).map((_, i) => {
            const h = Math.random() * 60 + 20;
            const isPast = i < 8;
            return (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-all duration-500"
                style={{
                  height: `${h}%`,
                  backgroundColor: isPast ? "var(--energy-solar)" : "var(--border-default)",
                  opacity: isPast ? 0.5 : 0.2,
                }}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
