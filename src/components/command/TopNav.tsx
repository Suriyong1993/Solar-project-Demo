import { useEffect, useState } from "react";
import { Wifi, Zap } from "lucide-react";
import { motion } from "framer-motion";
import type { TuyaStatus } from "@/lib/tuya-integration";

export function TopNav({ tuya }: { tuya?: TuyaStatus }) {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const t = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const isConnected = tuya?.source === "tuya";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-40 mx-4 mt-4 md:mx-8"
    >
      <div className="glass rounded-[28px] px-6 py-3 flex items-center justify-between">
        {/* Left — Brand */}
        <div className="flex items-center gap-3">
          <div className="relative grid h-9 w-9 place-items-center">
            <div
              className="absolute inset-0 rounded-full opacity-20"
              style={{
                background: "radial-gradient(50% 50% at 50% 50%, #00d4ff, transparent)",
              }}
            />
            <div
              className="relative grid h-8 w-8 place-items-center rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,245,147,0.1))",
                border: "1px solid rgba(0,212,255,0.15)",
              }}
            >
              <Zap className="h-4 w-4 text-[#00d4ff]" strokeWidth={2} />
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[14px] font-semibold tracking-tight text-[#e8e8f0]">
              Radiant Core
            </span>
            <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-[#6b6b80]">
              Energy Command Center
            </span>
          </div>
        </div>

        {/* Center — Status */}
        <div className="hidden items-center gap-6 md:flex">
          {/* Connection status */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${isConnected ? "animate-ping" : ""}`}
                style={{
                  backgroundColor: isConnected ? "#00f593" : "#f59e0b",
                  opacity: isConnected ? 0.6 : 0.3,
                }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{
                  backgroundColor: isConnected ? "#00f593" : "#f59e0b",
                }}
              />
            </span>
            <Wifi className="h-3 w-3" style={{ color: isConnected ? "#00f593" : "#f59e0b" }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: isConnected ? "#00f593" : "#f59e0b" }}
            >
              {isConnected ? "LIVE" : tuya?.source === "connecting" ? "CONNECTING" : "SIMULATION"}
            </span>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-[1px] bg-white/[0.06]" />
            <span className="font-mono text-[11px] font-medium tabular-nums text-[#00d4ff]">
              {t}
            </span>
            <span className="text-[8px] font-medium uppercase tracking-[0.12em] text-[#6b6b80]">
              UTC+7
            </span>
          </div>

          {/* System health dot */}
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-[1px] bg-white/[0.06]" />
            <span className="dot" style={{ color: "#00d4ff" }} />
            <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#6b6b80]">
              System OK
            </span>
          </div>
        </div>

        {/* Right — Device info */}
        <div className="flex items-center gap-2">
          <div
            className="rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]"
            style={{
              backgroundColor: "rgba(0,212,255,0.05)",
              border: "1px solid rgba(0,212,255,0.1)",
              color: "#00d4ff",
            }}
          >
            {tuya?.deviceId ? `DEV-${tuya.deviceId.substring(0, 6)}` : "SIM MODE"}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
