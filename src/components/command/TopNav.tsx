import { useEffect, useState } from "react";
import { Bell, Settings, Sun, Thermometer, Wifi, BarChart3, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

import type { TuyaStatus } from "@/lib/tuya-integration";

export function TopNav({ tuya, onOpenSpecs, onOpenAlerts, onOpenSettings }: { tuya?: TuyaStatus; onOpenSpecs: () => void; onOpenAlerts?: () => void; onOpenSettings?: () => void }) {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const t = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 mx-4 flex h-14 items-center justify-between rounded-lg border border-white/[0.06] bg-[#050816]/60 px-5 backdrop-blur-[30px] md:mx-8"
    >
      {/* left */}
      <div className="flex items-center gap-3">
        <div className="relative grid h-8 w-8 place-items-center rounded-md border border-[#d4a032]/20 bg-[#d4a032]/5">
          <Sun className="h-4 w-4 text-[#d4a032]" strokeWidth={2} />
        </div>
        <div className="hidden flex-col leading-tight sm:flex">
          <span className="text-[13px] font-semibold tracking-tight text-[#e2e2e8]">SOLAR MONITOR</span>
          <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#6b6b7b]">MPPT-6096 Telemetry</span>
        </div>
      </div>

      {/* center — status */}
      <div className="hidden items-center gap-4 lg:flex">
        <StatusLine tuya={tuya} />
        <div className="flex items-center gap-1.5">
          <Thermometer className="h-3 w-3 text-[#6b6b7b]" />
          <span className="text-[11px] font-medium text-[#6b6b7b]">{tuya?.source === "tuya" ? "—" : "—"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono tabular-nums font-medium text-[#d4a032]">{t}</span>
          <span className="text-[9px] uppercase tracking-wider text-[#6b6b7b]">UTC+7</span>
        </div>
      </div>

      {/* right */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSpecs}
          className="hidden items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#6b6b7b] transition-all hover:border-[#d4a032]/20 hover:text-[#d4a032] sm:flex"
        >
          <BarChart3 className="h-3 w-3" />
          Specs
        </button>
        <span className="hidden rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 font-mono text-[10px] font-medium tracking-wider text-[#6b6b7b] md:inline-block">
          {tuya?.deviceId ? `DEV-${tuya.deviceId.substring(0, 6)}` : "SIM MODE"}
        </span>
        <IconButton onClick={onOpenAlerts}><Bell className="h-3.5 w-3.5" /></IconButton>
        <IconButton onClick={onOpenSettings}><Settings className="h-3.5 w-3.5" /></IconButton>
      </div>
    </motion.header>
  );
}

function StatusLine({ tuya }: { tuya?: TuyaStatus }) {
  if (tuya?.source === "connecting") {
    return (
      <div className="flex items-center gap-2">
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping-subtle rounded-full bg-[#d4a032] opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#d4a032]" />
        </span>
        <RefreshCw className="h-3 w-3 animate-spin text-[#d4a032]" />
        <span className="text-[11px] font-medium text-[#d4a032]">CONNECTING</span>
      </div>
    );
  }
  if (tuya?.source === "tuya") {
    return (
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping-subtle rounded-full bg-[#2dd4bf] opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2dd4bf]" />
        </span>
        <Wifi className="h-3 w-3 text-[#2dd4bf] animate-data-pulse" />
        <span className="text-[11px] font-medium text-[#2dd4bf]">LIVE</span>
      </div>
    );
  }
  if (tuya?.source === "offline") {
    return (
      <div className="flex items-center gap-2">
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#dc4446]" />
        <Wifi className="h-3 w-3 text-[#dc4446]" />
        <span className="text-[11px] font-medium text-[#dc4446]">OFFLINE</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#d4a032]" />
      <Wifi className="h-3 w-3 text-[#d4a032]" />
      <span className="text-[11px] font-medium text-[#d4a032]">SIMULATION</span>
    </div>
  );
}

function IconButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded-md border border-white/[0.06] bg-white/[0.02] text-[#6b6b7b] transition-all hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-[#e2e2e8]"
    >
      {children}
    </button>
  );
}
