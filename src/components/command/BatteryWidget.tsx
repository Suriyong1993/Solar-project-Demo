import { motion } from "framer-motion";
import { Battery } from "lucide-react";

type BatteryWidgetProps = {
  batteryPct: number;
  isCharging: boolean;
  batteryNetW: number;
  todayKwh: number;
  runtimeHours: number;
};

export function BatteryWidget({
  batteryPct,
  isCharging,
  batteryNetW,
  todayKwh,
  runtimeHours,
}: BatteryWidgetProps) {
  const r = 130;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - batteryPct / 100);
  const runtimeStr = runtimeHours > 24 ? "24+h" : `${runtimeHours.toFixed(0)}h`;
  const accent = isCharging ? "#2dd4bf" : "#dc4446";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="panel relative flex flex-col items-center justify-center overflow-hidden rounded-lg p-8"
      style={{ minHeight: "380px" }}
    >
      {/* Title */}
      <div className="absolute top-4 left-5">
        <div
          className="text-[9px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
        >
          BATTERY STATE
        </div>
      </div>

      {/* Gauge */}
      <div className="relative mt-4">
        <svg viewBox="0 0 300 300" className="h-[280px] w-[280px] -rotate-90">
          <defs>
            <linearGradient id="batRing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={accent} />
              <stop offset="50%" stopColor="#d4a032" />
              <stop offset="100%" stopColor={isCharging ? "#2dd4bf" : "#dc4446"} />
            </linearGradient>
          </defs>
          <circle
            cx="150"
            cy="150"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="16"
          />
          <circle
            cx="150"
            cy="150"
            r={r}
            fill="none"
            stroke="url(#batRing)"
            strokeOpacity="0.35"
            strokeWidth="20"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
          <circle
            cx="150"
            cy="150"
            r={r}
            fill="none"
            stroke="url(#batRing)"
            strokeWidth="10"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Battery className="h-8 w-8" style={{ color: accent }} strokeWidth={2} />
          <div
            className="mt-2 text-7xl font-bold tabular-nums leading-none"
            style={{ color: accent, fontFamily: "JetBrains Mono", letterSpacing: "-0.02em" }}
          >
            {batteryPct.toFixed(0)}
          </div>
          <div
            className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
          >
            {isCharging ? "CHARGING" : "DISCHARGING"}
          </div>
          <div
            className="mt-2 text-sm font-semibold"
            style={{ color: accent, fontFamily: "JetBrains Mono" }}
          >
            {isCharging ? "+" : "-"}
            {batteryNetW}W
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid w-full grid-cols-3 gap-2">
        <MiniStat label="Runtime" value={runtimeStr} color="#2dd4bf" />
        <MiniStat label="Today" value={`${todayKwh.toFixed(1)}kWh`} color="#d4a032" />
        <MiniStat label="Cycles" value="—" color="#dc4446" />
      </div>
    </motion.div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-white/[0.04] bg-white/[0.01] py-2.5">
      <div
        className="text-[9px] font-semibold uppercase tracking-[0.15em]"
        style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
      >
        {label}
      </div>
      <div className="mt-0.5 text-base font-bold" style={{ color, fontFamily: "JetBrains Mono" }}>
        {value}
      </div>
    </div>
  );
}
