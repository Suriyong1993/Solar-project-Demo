import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, Settings, Cpu } from "lucide-react";

type ConfigStatus = { clientId: boolean; clientSecret: boolean; deviceId: boolean; endpoint: string };
const DEFAULT_CONFIG_STATUS: ConfigStatus = { clientId: false, clientSecret: false, deviceId: false, endpoint: "https://openapi.tuyaus.com" };

type Props = { isOpen: boolean; onClose: () => void; source: string; lastSync: number; deviceId: string; onReconnect: () => void; configStatus?: ConfigStatus };

export function SettingsPanel({ isOpen, onClose, source, lastSync, deviceId, onReconnect, configStatus }: Props) {
  const [testing, setTesting] = useState(false);
  const config = configStatus ?? DEFAULT_CONFIG_STATUS;
  const allConfigured = config.clientId && config.clientSecret && config.deviceId;

  const handleReconnect = async () => { setTesting(true); onReconnect(); setTimeout(() => setTesting(false), 2000); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg-page)]/98 backdrop-blur-sm">
          <div className="absolute inset-0 -z-10" style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-page)]/90 px-5 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded border border-[var(--status-warning)]/20 bg-[var(--status-warning)]/5">
                <Settings className="h-4 w-4" style={{ color: "var(--status-warning)" }} />
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wider" style={{ color: "var(--status-warning)", fontFamily: "var(--font-sans)" }}>SETTINGS</div>
                <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>Connection & Config</div>
              </div>
            </div>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded border border-[var(--border-default)] bg-[var(--muted)] transition-all hover:border-[var(--status-error)]/20 hover:bg-[var(--status-error)]/5">
              <X className="h-4 w-4 text-[var(--text-muted)]" />
            </button>
          </header>
          <main className="mx-auto max-w-[800px] px-5 py-10 space-y-8">
            <section>
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>Connection</h3>
              <div className="rounded-lg border border-[var(--border-default)] bg-[var(--muted)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {source === "tuya" ? <Wifi className="h-5 w-5 text-[var(--status-online)]" /> : <WifiOff className="h-5 w-5 text-[var(--status-error)]" />}
                    <div>
                      <div className="text-[12px] font-semibold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-mono)" }}>Tuya IoT Cloud</div>
                      <div className="text-[10px] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>{source === "tuya" ? "Connected" : source === "offline" ? "Offline" : "Not configured"}</div>
                    </div>
                  </div>
                  <button onClick={handleReconnect} disabled={testing} className="flex items-center gap-2 rounded-md px-4 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors border border-[var(--border-default)] bg-[var(--muted)] hover:bg-[var(--surface-raised)] text-[var(--text-primary)] disabled:opacity-50">
                    <RefreshCw className={`h-3 w-3 ${testing ? "animate-spin" : ""}`} /> {testing ? "Testing…" : "Reconnect"}
                  </button>
                </div>
                <div className="space-y-2">
                  <ConfigRow label="CLIENT ID" ok={config.clientId} />
                  <ConfigRow label="CLIENT SECRET" ok={config.clientSecret} />
                  <ConfigRow label="DEVICE ID" ok={config.deviceId} />
                </div>
                <div className="mt-4 flex items-center justify-between rounded-md border border-[var(--border-default)] px-3 py-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>ENDPOINT</span>
                  <span className="text-[10px] font-mono text-[var(--text-primary)]">{config.endpoint}</span>
                </div>
                {deviceId && (
                  <div className="mt-2 flex items-center justify-between rounded-md border border-[var(--border-default)] px-3 py-2.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>ACTIVE DEVICE</span>
                    <span className="text-[10px] font-mono text-[var(--text-primary)]">DEV-{deviceId.substring(0, 8)}</span>
                  </div>
                )}
                {!allConfigured && (
                  <div className="mt-4 rounded-md border border-[var(--status-warning)]/20 bg-[var(--status-warning)]/5 px-4 py-3">
                    <p className="text-[10px] leading-relaxed text-[var(--status-warning)]" style={{ fontFamily: "var(--font-mono)" }}>
                      ⚡ Tuya credentials not fully configured. Set <span className="font-bold">TUYA_CLIENT_ID</span>, <span className="font-bold">TUYA_CLIENT_SECRET</span>, and <span className="font-bold">TUYA_DEVICE_ID</span> in <span className="font-bold">.env</span> (server-side) to connect live.
                    </p>
                  </div>
                )}
              </div>
            </section>
            <section>
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>System</h3>
              <div className="rounded-lg border border-[var(--border-default)] bg-[var(--muted)] p-5">
                <div className="flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-[var(--text-muted)]" />
                  <div className="text-[10px] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>
                    Solar Monitor — Radiant Command Core<br />Data source: {source === "tuya" ? "Tuya IoT API" : "Simulation Engine"}
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
    <div className="flex items-center justify-between rounded-md border border-[var(--border-default)] bg-[var(--muted)] px-3 py-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>{label}</span>
      <span className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: ok ? "var(--status-online)" : "var(--status-error)", fontFamily: "var(--font-mono)" }}>
        {ok ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{ok ? "SET" : "MISSING"}
      </span>
    </div>
  );
}
