import { useEffect, useState } from "react";
import { Bell, Settings, Sun, Thermometer, Wifi } from "lucide-react";
import { motion } from "framer-motion";

export function TopNav() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const t = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="glass sticky top-4 z-40 mx-4 flex h-[72px] items-center justify-between rounded-2xl px-5 md:mx-8"
      style={{ boxShadow: "0 20px 80px rgba(0,0,0,0.45), 0 0 40px rgba(250,204,21,0.06)" }}
    >
      {/* left */}
      <div className="flex items-center gap-4">
        <div className="relative grid h-10 w-10 place-items-center rounded-xl" style={{ background: "radial-gradient(circle at 30% 30%, #fde68a, #f59e0b)", boxShadow: "0 0 24px rgba(250,204,21,0.45)" }}>
          <Sun className="h-5 w-5 text-[#1a1100]" strokeWidth={2.4} />
        </div>
        <div className="hidden flex-col leading-tight sm:flex">
          <span className="font-display text-[15px] font-semibold tracking-tight text-white">MPPT 6096</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">Solar Monitor</span>
        </div>
      </div>

      {/* center */}
      <div className="hidden items-center gap-3 lg:flex">
        <StatusPill>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <Wifi className="h-3.5 w-3.5 text-emerald-300" />
          <span className="text-[12px] font-medium text-emerald-200">Online</span>
        </StatusPill>
        <StatusPill>
          <Thermometer className="h-3.5 w-3.5 text-amber-300" />
          <span className="text-[12px] font-medium text-slate-200">31°C</span>
        </StatusPill>
        <StatusPill>
          <span className="font-display tabular-nums text-[12px] font-medium text-slate-100">{t}</span>
        </StatusPill>
      </div>

      {/* right */}
      <div className="flex items-center gap-2">
        <span className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-display text-[11px] font-medium tracking-widest text-slate-300 md:inline-block">
          ID · 6096-A · 7F2C
        </span>
        <IconButton><Bell className="h-4 w-4" /></IconButton>
        <IconButton><Settings className="h-4 w-4" /></IconButton>
      </div>
    </motion.header>
  );
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 backdrop-blur">
      {children}
    </div>
  );
}

function IconButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 transition-all hover:border-amber-300/30 hover:bg-white/[0.08] hover:text-amber-200 hover:shadow-[0_0_24px_rgba(250,204,21,0.18)]">
      {children}
    </button>
  );
}
