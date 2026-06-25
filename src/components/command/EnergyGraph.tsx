import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SeriesPoint } from "@/lib/command-data";

export function EnergyGraph({ data }: { data: SeriesPoint[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="panel relative overflow-hidden rounded-lg p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#d4a032", fontFamily: "JetBrains Mono" }}>
            TELEMETRY_24H
          </div>
          <div className="mt-1 text-lg font-bold" style={{ color: "#e2e2e8", fontFamily: "Chakra Petch" }}>
            ENERGY FLOW
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-[10px] font-medium">
          <Legend color="#d4a032" label="SOLAR" />
          <Legend color="#60a5fa" label="LOAD" />
          <Legend color="#2dd4bf" label="SOC" />
        </div>
      </div>

      <div className="mt-5 h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gSolar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4a032" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#d4a032" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gLoad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gBat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="t"
              tick={{ fill: "#3a3a4a", fontSize: 9, fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
              tickFormatter={(v) => `${v.toString().padStart(2, "0")}:00`}
            />
            <YAxis
              tick={{ fill: "#3a3a4a", fontSize: 9, fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
            />
            <Tooltip
              cursor={{ stroke: "#d4a032", strokeWidth: 1, strokeDasharray: "4 4" }}
              contentStyle={{
                background: "rgba(12,12,18,0.95)",
                border: "1px solid rgba(212,160,50,0.2)",
                borderRadius: 8,
                color: "#e2e2e8",
                fontFamily: "JetBrains Mono",
                fontSize: 10,
                fontWeight: 600,
              }}
              labelFormatter={(v) => `${v.toString().padStart(2, "0")}:00`}
              formatter={(value: number, name: string) => {
                const units: Record<string, string> = { solar: "kW", load: "kW", battery: "%" };
                return [`${Number(value).toFixed(2)} ${units[name] || ""}`, name.toUpperCase()];
              }}
            />
            <Area type="monotone" dataKey="solar" stroke="#d4a032" strokeWidth={2} fill="url(#gSolar)" />
            <Area type="monotone" dataKey="load" stroke="#60a5fa" strokeWidth={1.5} fill="url(#gLoad)" />
            <Area type="monotone" dataKey="battery" stroke="#2dd4bf" strokeWidth={1.5} fill="url(#gBat)" yAxisId={0} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5" style={{ color, fontFamily: "JetBrains Mono" }}>
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
