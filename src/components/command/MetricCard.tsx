import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Accent = "amber" | "teal" | "warm" | "cool";

const accentMap: Record<Accent, { color: string; dimColor: string }> = {
  amber: { color: "#d4a032", dimColor: "#8b6914" },
  teal: { color: "#2dd4bf", dimColor: "#0f766e" },
  warm: { color: "#e8a84a", dimColor: "#a07020" },
  cool: { color: "#60a5fa", dimColor: "#1e40af" },
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
  const a = accentMap[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="panel group relative overflow-hidden rounded-lg p-4"
    >
      {/* Top: icon + status */}
      <div className="flex items-start justify-between">
        <div
          className="grid h-8 w-8 place-items-center rounded-md border"
          style={{
            borderColor: `${a.color}20`,
            backgroundColor: `${a.color}08`,
          }}
        >
          <span style={{ color: a.color }}>{icon}</span>
        </div>
        {delta ? (
          <span
            className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
            style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
          >
            {delta}
          </span>
        ) : null}
      </div>

      {/* Label */}
      <div
        className="mt-3 text-[9px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
      >
        {label}
      </div>

      {/* Value */}
      <div className="mt-1.5 flex items-baseline gap-2">
        <span
          className="text-[2.5rem] font-bold tabular-nums leading-none"
          style={{ color: a.color, fontFamily: "JetBrains Mono", letterSpacing: "-0.02em" }}
        >
          {value}
        </span>
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
        >
          {unit}
        </span>
      </div>
    </motion.div>
  );
}
