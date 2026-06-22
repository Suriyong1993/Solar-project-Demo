import { motion } from "framer-motion";
import { Sunrise, Sunset, Sun as SunIcon } from "lucide-react";

export function WeatherWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="glass relative overflow-hidden rounded-3xl p-6"
      style={{ boxShadow: "0 30px 90px rgba(0,0,0,0.45), 0 0 60px rgba(250,204,21,0.10)" }}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-amber-400/25 blur-3xl" />
      <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">Local conditions</div>
      <div className="mt-1 font-display text-xl font-semibold text-white">Sky Report</div>

      <div className="mt-6 flex items-center gap-5">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle,#fde68a, #f59e0b)", boxShadow: "0 0 50px rgba(250,204,21,0.55)" }} />
          <div className="absolute inset-0" style={{ animation: "ray-spin 30s linear infinite" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 block h-3 w-[2px] rounded-full bg-amber-300/80"
                style={{ transform: `rotate(${i * 45}deg) translateY(-58px)` }}
              />
            ))}
          </div>
          <SunIcon className="absolute inset-0 m-auto h-8 w-8 text-[#1a1100]" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-display text-5xl font-semibold text-white">31<span className="text-2xl text-slate-400">°C</span></div>
          <div className="text-sm text-slate-300">Sunny · clear skies</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-[11px]">
        <Row label="UV Index" value="8.4" tone="text-amber-200" />
        <Row label="Sunrise" value="06:12" tone="text-sky-200" icon={<Sunrise className="h-3.5 w-3.5" />} />
        <Row label="Sunset" value="19:48" tone="text-violet-200" icon={<Sunset className="h-3.5 w-3.5" />} />
      </div>
    </motion.div>
  );
}

function Row({ label, value, tone, icon }: { label: string; value: string; tone: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
      <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
        {icon}{label}
      </div>
      <div className={`mt-1 font-display text-lg font-semibold tabular-nums ${tone}`}>{value}</div>
    </div>
  );
}
