import { motion } from "framer-motion";
import { Activity, Wifi, WifiOff, Radio } from "lucide-react";
import type { TuyaStatus } from "@/lib/tuya-integration";

interface StatusBarProps {
  tuya?: TuyaStatus;
  isCharging: boolean;
}

export function StatusBar({ tuya, isCharging }: StatusBarProps) {
  const isConnected = tuya?.source === "tuya";
  const isConnecting = tuya?.source === "connecting";
  const isOffline = tuya?.source === "offline";
  const isSim = !isConnected && !isConnecting && !isOffline;

  const systemStatus = isOffline
    ? { label: "System Offline", color: "var(--status-error)", icon: <WifiOff className="h-3.5 w-3.5" /> }
    : isConnecting
    ? { label: "Connecting…", color: "var(--status-warning)", icon: <Radio className="h-3.5 w-3.5 animate-pulse" /> }
    : isSim
    ? { label: "Simulation Mode", color: "var(--status-info)", icon: <Activity className="h-3.5 w-3.5" /> }
    : { label: "System Live", color: "var(--status-online)", icon: <Wifi className="h-3.5 w-3.5" /> };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex flex-wrap items-center gap-2.5 mb-4"
    >
      <div
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
        style={{
          backgroundColor: `${systemStatus.color}12`,
          border: `1px solid ${systemStatus.color}20`,
          color: systemStatus.color,
        }}
      >
        {systemStatus.icon}
        {systemStatus.label}
      </div>

      {isCharging && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{
            backgroundColor: "color-mix(in srgb, var(--energy-solar) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--energy-solar) 18%, transparent)",
            color: "var(--energy-solar)",
          }}
        >
          <span className="dot bg-[var(--energy-solar)] animate-pulse" />
          Surplus Charging
        </motion.div>
      )}

      {tuya?.lastSync ? (
        <span className="text-[10px] text-[var(--text-muted)] font-mono tracking-wide">
          Last sync: {new Date(tuya.lastSync).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ) : null}
    </motion.div>
  );
}
