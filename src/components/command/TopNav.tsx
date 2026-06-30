import { useEffect, useState } from "react";
import { Wifi, WifiOff, Zap, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import type { TuyaStatus } from "@/lib/tuya-integration";

export function TopNav({ tuya }: { tuya?: TuyaStatus }) {
  const [time, setTime] = useState(() => new Date());
  const [isLight, setIsLight] = useState(() => document.documentElement.classList.contains("light"));

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = () => setIsLight(document.documentElement.classList.contains("light"));
    const obs = new MutationObserver(handler);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const toggleTheme = () => document.documentElement.classList.toggle("light");

  const t = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  const isConnected = tuya?.source === "tuya";
  const isConnecting = tuya?.source === "connecting";
  const isOffline = tuya?.source === "offline";
  const isSim = !isConnected && !isConnecting && !isOffline;

  const statusMeta = isConnected
    ? { color: "var(--status-online)", label: "LIVE", Icon: Wifi }
    : isConnecting
    ? { color: "var(--status-warning)", label: "SYNCING", Icon: WifiOff }
    : isOffline
    ? { color: "var(--status-error)", label: "OFFLINE", Icon: WifiOff }
    : { color: "var(--status-info)", label: "SIMULATION", Icon: WifiOff };

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-40 mx-4 mt-4 md:mx-6"
    >
      <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-[var(--status-online)]/10 border border-[var(--status-online)]/20">
            <Zap className="h-4 w-4" style={{ color: "var(--status-online)" }} strokeWidth={2} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">Radiant Core</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">Energy Command Center</span>
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{ backgroundColor: `${statusMeta.color}10`, border: `1px solid ${statusMeta.color}20`, color: statusMeta.color }}>
            <span className="relative flex h-2 w-2">
              {(isConnected || isConnecting) && (
                <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ backgroundColor: statusMeta.color, opacity: 0.4 }} />
              )}
              <span className="relative inline-flex h-full w-full rounded-full" style={{ backgroundColor: statusMeta.color }} />
            </span>
            <statusMeta.Icon className="h-3 w-3" />
            {statusMeta.label}
          </div>
          <div className="h-4 w-px bg-[var(--border-default)]" />
          <span className="font-mono text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">{t}</span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">UTC+7</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border-default)] bg-[var(--muted)]/50 text-[var(--text-secondary)] transition-colors hover:bg-[var(--muted)]"
            aria-label="Toggle theme"
          >
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <div className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{
              backgroundColor: isSim ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "color-mix(in srgb, var(--status-online) 8%, transparent)",
              border: `1px solid ${isSim ? "color-mix(in srgb, var(--accent) 15%, transparent)" : "color-mix(in srgb, var(--status-online) 15%, transparent)"}`,
              color: isSim ? "var(--accent)" : "var(--status-online)",
            }}>
            {tuya?.deviceId ? `DEV-${tuya.deviceId.substring(0, 8).toUpperCase()}` : "SIM MODE"}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
