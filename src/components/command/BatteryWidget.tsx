import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function BatteryWidget({ batteryPct }: { batteryPct: number }) {
  const r = 96;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - batteryPct / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="glass relative overflow-hidden rounded-3xl p-7"
      style={{ boxShadow: "0 30px 90px rgba(0,0,0,0.45), 0 0 60px rgba(16,185,129,0.12)" }}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">Battery Storage</div>
          <div className="mt-1 font-display text-xl font-semibold text-white">State of Charge</div>
        </div>
        <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 font-display text-[10px] font-medium tracking-widest text-emerald-200">CHARGING</span>
      </div>

      <div className="mt-6 grid items-center gap-6 md:grid-cols-[auto_1fr]">
        <div className="relative mx-auto h-[220px] w-[220px]">
          <svg viewBox="0 0 240 240" className="h-full w-full -rotate-90">
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#facc15" />
              </linearGradient>
              <filter id="ringGlow"><feGaussianBlur stdDeviation="4" /></filter>
            </defs>
            <circle cx="120" cy="120" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
            <circle cx="120" cy="120" r={r} fill="none" stroke="url(#ringGrad)" strokeOpacity="0.4" strokeWidth="14" filter="url(#ringGlow)" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
            <circle cx="120" cy="120" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="8" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
          </svg>
          {/* orbit particles */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          >
            {[0, 120, 240].map((deg) => (
              <span
                key={deg}
                className="absolute left-1/2 top-1/2 block h-2 w-2 rounded-full"
                style={{
                  background: "#a7f3d0",
                  boxShadow: "0 0 12px #34d399",
                  transform: `rotate(${deg}deg) translateY(-104px)`,
                }}
              />
            ))}
          </motion.div>
          {/* center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Zap className="h-5 w-5 text-emerald-300" style={{ filter: "drop-shadow(0 0 8px #34d399)" }} />
            <div className="mt-1 font-display text-5xl font-semibold tabular-nums text-white">{batteryPct.toFixed(0)}<span className="text-2xl text-slate-400">%</span></div>
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Charging</div>
          </div>
        </div>

        <div className="space-y-3">
          <Stat label="Today's gain" value="+3.2" unit="kWh" tone="emerald" />
          <Stat label="Charging rate" value="1.89" unit="kW" tone="amber" />
          <Stat label="Time to full" value="0:54" unit="hrs" tone="sky" />
          <Stat label="Cycles" value="412" unit="lifetime" tone="violet" />
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, unit, tone }: { label: string; value: string; unit: string; tone: "emerald" | "amber" | "sky" | "violet" }) {
  const colors = {
    emerald: "text-emerald-200",
    amber: "text-amber-200",
    sky: "text-sky-200",
    violet: "text-violet-200",
  };
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <span className="flex items-baseline gap-1">
        <span className={`font-display text-lg font-semibold tabular-nums ${colors[tone]}`}>{value}</span>
        <span className="text-[10px] text-slate-500">{unit}</span>
      </span>
    </div>
  );
}
