import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Accent = "solar" | "sky" | "leaf" | "violet";

const accentMap: Record<Accent, { glow: string; ring: string; text: string; chip: string }> = {
  solar: {
    glow: "0 0 50px rgba(250,204,21,0.18)",
    ring: "rgba(250,204,21,0.35)",
    text: "text-amber-200",
    chip: "from-amber-300/30 to-amber-500/10",
  },
  sky: {
    glow: "0 0 50px rgba(56,189,248,0.18)",
    ring: "rgba(56,189,248,0.35)",
    text: "text-sky-200",
    chip: "from-sky-300/30 to-sky-500/10",
  },
  leaf: {
    glow: "0 0 50px rgba(16,185,129,0.18)",
    ring: "rgba(16,185,129,0.35)",
    text: "text-emerald-200",
    chip: "from-emerald-300/30 to-emerald-500/10",
  },
  violet: {
    glow: "0 0 50px rgba(139,92,246,0.18)",
    ring: "rgba(139,92,246,0.35)",
    text: "text-violet-200",
    chip: "from-violet-300/30 to-violet-500/10",
  },
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.4 } }}
      className="glass group relative overflow-hidden rounded-2xl p-4"
      style={{ boxShadow: `0 20px 60px rgba(0,0,0,0.35), ${a.glow}` }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-3xl" style={{ background: a.ring }} />
      <div className="flex items-center justify-between">
        <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${a.chip} ${a.text}`}>
          {icon}
        </div>
        {delta && (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-display text-[10px] font-medium tracking-wider text-slate-300">
            {delta}
          </span>
        )}
      </div>
      <div className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className={`font-display text-3xl font-semibold tabular-nums ${a.text}`}>{value}</span>
        <span className="text-xs font-medium text-slate-400">{unit}</span>
      </div>
    </motion.div>
  );
}
