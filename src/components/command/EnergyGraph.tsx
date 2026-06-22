import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SeriesPoint } from "@/lib/command-data";

export function EnergyGraph({ data }: { data: SeriesPoint[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="glass relative overflow-hidden rounded-3xl p-6"
      style={{ boxShadow: "0 30px 90px rgba(0,0,0,0.45)" }}
    >
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-20 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">24-hour intelligence</div>
          <div className="mt-1 font-display text-2xl font-semibold text-white">Energy Flow Telemetry</div>
        </div>
        <div className="flex flex-wrap gap-4 text-[11px]">
          <Legend color="#facc15" label="Solar Production" />
          <Legend color="#38bdf8" label="Consumption" />
          <Legend color="#10b981" label="Battery SOC" />
        </div>
      </div>

      <div className="mt-6 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="gSolar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#facc15" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#facc15" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gLoad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gBat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}:00`} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ stroke: "rgba(250,204,21,0.4)", strokeWidth: 1, strokeDasharray: "4 4" }}
              contentStyle={{
                background: "rgba(15,23,42,0.92)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                color: "#f8fafc",
                fontFamily: "Space Grotesk, Inter",
                fontSize: 12,
              }}
              labelFormatter={(v) => `${v}:00`}
            />
            <Area type="monotone" dataKey="solar" stroke="#facc15" strokeWidth={2.4} fill="url(#gSolar)" />
            <Area type="monotone" dataKey="load" stroke="#38bdf8" strokeWidth={2.2} fill="url(#gLoad)" />
            <Area type="monotone" dataKey="battery" stroke="#10b981" strokeWidth={1.8} fill="url(#gBat)" yAxisId={0} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-300">
      <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
      {label}
    </span>
  );
}
