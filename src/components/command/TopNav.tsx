import { useEffect, useState } from "react";
import { Wifi, WifiOff, Zap, Signal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TuyaStatus } from "@/lib/tuya-integration";

export function TopNav({ tuya }: { tuya?: TuyaStatus }) {
  const [time, setTime] = useState(() => new Date());
  const [latency, setLatency] = useState<number>(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date());
      setLatency(Math.round(Math.random() * 12 + 4)); // simulate 4–16ms
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const t = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const isConnected = tuya?.source === "tuya";
  const isConnecting = tuya?.source === "connecting";
  const isSim = !isConnected && !isConnecting;

  const statusColor = isConnected ? "#00f593" : isConnecting ? "#f59e0b" : "#00d4ff";
  const statusLabel = isConnected ? "LIVE" : isConnecting ? "SYNCING" : "SIMULATION";

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-40 mx-4 mt-4 md:mx-8"
    >
      <div
        className="rounded-[28px] px-5 py-3 flex items-center justify-between"
        style={{
          background: "rgba(10, 12, 20, 0.65)",
          backdropFilter: "blur(60px) saturate(1.8)",
          WebkitBackdropFilter: "blur(60px) saturate(1.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.03) inset, 0 8px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset",
        }}
      >
        {/* Left — Brand */}
        <div className="flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center">
            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                background: "radial-gradient(50% 50% at 50% 50%, rgba(0,212,255,0.2), transparent)",
              }}
            />
            <div
              className="relative grid h-9 w-9 place-items-center rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(0,212,255,0.2) 0%, rgba(0,245,147,0.12) 100%)",
                border: "1px solid rgba(0,212,255,0.25)",
                boxShadow: "0 0 16px rgba(0,212,255,0.15)",
              }}
            >
              <Zap className="h-4 w-4 text-[#00d4ff]" strokeWidth={2.5} />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <span
              className="text-[15px] font-bold tracking-tight"
              style={{
                background: "linear-gradient(90deg, #e8e8f0 0%, #00d4ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Radiant Core
            </span>
            <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#6b6b80]">
              Energy Command Center
            </span>
          </div>
        </div>

        {/* Center — Status */}
        <div className="hidden items-center gap-5 md:flex">
          {/* Connection status */}
          <AnimatePresence mode="wait">
            <motion.div
              key={statusLabel}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{
                backgroundColor: `${statusColor}0d`,
                border: `1px solid ${statusColor}20`,
              }}
            >
              <span className="relative flex h-2 w-2">
                {(isConnected || isConnecting) && (
                  <span
                    className="absolute inline-flex h-full w-full rounded-full animate-ping"
                    style={{ backgroundColor: statusColor, opacity: 0.5 }}
                  />
                )}
                <span
                  className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ backgroundColor: statusColor }}
                />
              </span>
              {isConnected ? (
                <Wifi className="h-3 w-3" style={{ color: statusColor }} />
              ) : (
                <WifiOff className="h-3 w-3" style={{ color: statusColor }} />
              )}
              <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: statusColor }}>
                {statusLabel}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Divider */}
          <div className="h-4 w-[1px] bg-white/[0.06]" />

          {/* Timestamp */}
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[13px] font-semibold tabular-nums"
              style={{
                color: "#e8e8f0",
                textShadow: "0 0 20px rgba(0,212,255,0.2)",
              }}
            >
              {t}
            </span>
            <span className="text-[8px] font-semibold uppercase tracking-[0.15em] text-[#6b6b80]">UTC+7</span>
          </div>

          {/* Divider */}
          <div className="h-4 w-[1px] bg-white/[0.06]" />

          {/* Latency */}
          <div className="flex items-center gap-1.5">
            <Signal className="h-3 w-3 text-[#00f593]" />
            <span className="font-mono text-[10px] font-semibold text-[#00f593] tabular-nums">{latency}ms</span>
          </div>
        </div>

        {/* Right — Device + System */}
        <div className="flex items-center gap-2">
          {/* System OK */}
          <div className="hidden md:flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{
            backgroundColor: "rgba(0,212,255,0.05)",
            border: "1px solid rgba(0,212,255,0.08)",
          }}>
            <div
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "#00d4ff" }}
            />
            <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#6b6b80]">
              System OK
            </span>
          </div>

          {/* Device badge */}
          <div
            className="rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em]"
            style={{
              background: isSim
                ? "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,245,147,0.06))"
                : "rgba(0,245,147,0.08)",
              border: isSim ? "1px solid rgba(0,212,255,0.15)" : "1px solid rgba(0,245,147,0.15)",
              color: isSim ? "#00d4ff" : "#00f593",
            }}
          >
            {tuya?.deviceId ? `DEV-${tuya.deviceId.substring(0, 8).toUpperCase()}` : "SIM MODE"}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
