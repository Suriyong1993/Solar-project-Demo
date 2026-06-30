import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Accent = "amber" | "teal" | "warm" | "cool";

const accentMap: Record<Accent, string> = {
  amber: "var(--energy-solar)",
  teal: "var(--energy-battery)",
  warm: "var(--status-error)",
  cool: "var(--energy-grid)",
};

export function MetricCard({
  icon,
  label,
  value,
  unit,
  delta,
  accent,
  index = 0,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  unit: string;
  delta?: string;
  accent: Accent;
  index?: number;
}) {
  const color = accentMap[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="glass group relative overflow-hidden rounded-xl p-4"
    >
      <div className="flex items-start justify-between">
        <div
          className="grid h-8 w-8 place-items-center rounded-lg border"
          style={{
            borderColor: `color-mix(in srgb, ${color} 15%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
          }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        {delta ? (
          <span
            className="rounded-full border border-[var(--border-default)] bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {delta}
          </span>
        ) : null}
      </div>

      <div
        className="mt-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </div>

      <div className="mt-1.5 flex items-baseline gap-2">
        <span
          className="text-[2.5rem] font-bold tabular-nums leading-none"
          style={{ color, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}
        >
          {value}
        </span>
        <span
          className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {unit}
        </span>
      </div>
    </motion.div>
  );
}
