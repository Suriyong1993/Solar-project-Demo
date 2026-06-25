import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, Settings, Cpu } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  source: string;
  lastSync: number;
  deviceId: string;
  onReconnect: () => void;
};

type ConfigStatus = {
  clientId: boolean;
  clientSecret: boolean;
  deviceId: boolean;
  endpoint: string;
};

function getConfigStatus(): ConfigStatus {
  const env =
    typeof import.meta !== "undefined"
      ? (import.meta as unknown as { env: Record<string, string | undefined> }).env
      : process.env;
  if (!env) return { clientId: false, clientSecret: false, deviceId: false, endpoint: "—" };
  return {
    clientId: !!(env.VITE_TUYA_CLIENT_ID || env.TUYA_CLIENT_ID),
    clientSecret: !!(env.VITE_TUYA_CLIENT_SECRET || env.TUYA_CLIENT_SECRET),
    deviceId: !!(env.VITE_TUYA_DEVICE_ID || env.TUYA_DEVICE_ID),
    endpoint: env.VITE_TUYA_ENDPOINT || env.TUYA_ENDPOINT || "https://openapi.tuyaus.com",
  };
}

export function SettingsPanel({ isOpen, onClose, source, lastSync, deviceId, onReconnect }: Props) {
  const [testing, setTesting] = useState(false);
  const config = getConfigStatus();
  const allConfigured = config.clientId && config.clientSecret && config.deviceId;

  const handleReconnect = async () => {
    setTesting(true);
    onReconnect();
    setTimeout(() => setTesting(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-[#050816]/98 backdrop-blur-sm"
        >
          <div
            className="absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#050816]/90 px-5 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded border border-[#d4a032]/20 bg-[#d4a032]/5">
                <Settings className="h-4 w-4 text-[#d4a032]" />
              </div>
              <div>
                <div
                  className="text-xs font-semibold tracking-wider"
                  style={{ color: "#d4a032", fontFamily: "Chakra Petch" }}
                >
                  SETTINGS
                </div>
                <div
                  className="text-[9px] uppercase tracking-widest"
                  style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                >
                  Connection & Config
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded border border-white/[0.06] bg-white/[0.02] transition-all hover:border-[#dc4446]/20 hover:bg-[#dc4446]/5"
            >
              <X className="h-4 w-4" style={{ color: "#6b6b7b" }} />
            </button>
          </header>

          <main className="mx-auto max-w-[800px] px-5 py-10">
            {/* Connection Status */}
            <section className="mb-8">
              <h3
                className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
              >
                Connection
              </h3>
              <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-lg border"
                      style={{
                        borderColor:
                          source === "tuya"
                            ? "rgba(45,212,191,0.2)"
                            : source === "offline"
                              ? "rgba(220,68,70,0.2)"
                              : "rgba(212,160,50,0.2)",
                        background:
                          source === "tuya"
                            ? "rgba(45,212,191,0.05)"
                            : source === "offline"
                              ? "rgba(220,68,70,0.05)"
                              : "rgba(212,160,50,0.05)",
                      }}
                    >
                      {source === "tuya" ? (
                        <Wifi className="h-5 w-5 text-[#2dd4bf]" />
                      ) : source === "offline" ? (
                        <WifiOff className="h-5 w-5 text-[#dc4446]" />
                      ) : (
                        <RefreshCw className="h-5 w-5 text-[#d4a032]" />
                      )}
                    </span>
                    <div>
                      <div
                        className="text-sm font-semibold"
                        style={{ color: "#e2e2e8", fontFamily: "Chakra Petch" }}
                      >
                        {source === "tuya"
                          ? "Tuya IoT — LIVE"
                          : source === "offline"
                            ? "Tuya IoT — OFFLINE"
                            : source === "connecting"
                              ? "Connecting..."
                              : "Simulation Mode"}
                      </div>
                      <div
                        className="text-[10px]"
                        style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                      >
                        {lastSync
                          ? `Last sync: ${new Date(lastSync).toLocaleTimeString()}`
                          : "No sync yet"}
                      </div>
                    </div>
                  </div>
                  <span
                    className="flex items-center gap-1.5 text-[10px] font-semibold"
                    style={{
                      color:
                        source === "tuya"
                          ? "#2dd4bf"
                          : source === "offline"
                            ? "#dc4446"
                            : "#d4a032",
                      fontFamily: "JetBrains Mono",
                    }}
                  >
                    {source === "tuya" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : source === "offline" ? (
                      <XCircle className="h-3 w-3" />
                    ) : (
                      <RefreshCw
                        className={`h-3 w-3 ${source === "connecting" ? "animate-spin" : ""}`}
                      />
                    )}
                    {source === "tuya"
                      ? "CONNECTED"
                      : source === "offline"
                        ? "DISCONNECTED"
                        : source === "connecting"
                          ? "PENDING"
                          : "SIMULATION"}
                  </span>
                </div>

                <button
                  onClick={handleReconnect}
                  disabled={testing || !allConfigured}
                  className="w-full rounded-md border py-2 text-[11px] font-semibold uppercase tracking-wider transition-all disabled:opacity-30"
                  style={{
                    borderColor: "rgba(45,212,191,0.2)",
                    background: "rgba(45,212,191,0.05)",
                    color: "#2dd4bf",
                    fontFamily: "JetBrains Mono",
                  }}
                >
                  {testing ? "Testing..." : "Test Connection"}
                </button>
              </div>
            </section>

            {/* Configuration */}
            <section>
              <h3
                className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
              >
                Environment
              </h3>
              <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-5">
                <div className="space-y-3">
                  <ConfigRow label="Client ID" ok={config.clientId} />
                  <ConfigRow label="Client Secret" ok={config.clientSecret} />
                  <ConfigRow label="Device ID" ok={config.deviceId} />
                  <div className="flex items-center justify-between rounded-md border border-white/[0.04] px-3 py-2.5">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                    >
                      ENDPOINT
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: "#e2e2e8" }}>
                      {config.endpoint}
                    </span>
                  </div>
                  {deviceId && (
                    <div className="flex items-center justify-between rounded-md border border-white/[0.04] px-3 py-2.5">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                      >
                        ACTIVE DEVICE
                      </span>
                      <span className="text-[10px] font-mono" style={{ color: "#e2e2e8" }}>
                        DEV-{deviceId.substring(0, 8)}
                      </span>
                    </div>
                  )}
                </div>

                {!allConfigured && (
                  <div className="mt-4 rounded-md border border-[#d4a032]/20 bg-[#d4a032]/5 px-4 py-3">
                    <p
                      className="text-[10px] leading-relaxed"
                      style={{ color: "#d4a032", fontFamily: "JetBrains Mono" }}
                    >
                      ⚡ Tuya credentials not fully configured. Set{" "}
                      <span className="font-bold">VITE_TUYA_CLIENT_ID</span>,{" "}
                      <span className="font-bold">VITE_TUYA_CLIENT_SECRET</span>, and{" "}
                      <span className="font-bold">VITE_TUYA_DEVICE_ID</span> in{" "}
                      <span className="font-bold">.env</span> to connect live.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* System */}
            <section className="mt-8">
              <h3
                className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
              >
                System
              </h3>
              <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-5">
                <div className="flex items-center gap-3">
                  <Cpu className="h-5 w-5" style={{ color: "#3a3a4a" }} />
                  <div
                    className="text-[10px]"
                    style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                  >
                    Solar Monitor — Radiant Command Core
                    <br />
                    Data source: {source === "tuya" ? "Tuya IoT API" : "Simulation Engine"}
                  </div>
                </div>
              </div>
            </section>
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConfigRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-white/[0.04] bg-white/[0.01] px-3 py-2.5">
      <span
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
      >
        {label}
      </span>
      <span
        className="flex items-center gap-1.5 text-[10px] font-semibold"
        style={{
          color: ok ? "#2dd4bf" : "#dc4446",
          fontFamily: "JetBrains Mono",
        }}
      >
        {ok ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        {ok ? "SET" : "MISSING"}
      </span>
    </div>
  );
}
