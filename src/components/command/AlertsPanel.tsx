import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Wifi, WifiOff, Info, RefreshCw, Sun } from "lucide-react";

type Props = { isOpen: boolean; onClose: () => void; source: string; lastSync: number };

const alerts = [{ icon: <Sun className="h-3 w-3" />, label: "System Initialized", detail: "Solar Monitor dashboard started", time: "Now", color: "var(--status-online)" }];

export function AlertsPanel({ isOpen, onClose, source, lastSync }: Props) {
  const liveAlerts = [
    ...(source === "tuya" ? [{ icon: <Wifi className="h-3 w-3" />, label: "Tuya Connected", detail: "Live data stream active", time: lastSync ? `${Math.floor((Date.now() - lastSync) / 1000)}s ago` : "Just now", color: "var(--status-online)" }]
      : source === "offline" ? [{ icon: <WifiOff className="h-3 w-3" />, label: "Tuya Offline", detail: "Falling back to simulation", time: lastSync ? `${Math.floor((Date.now() - lastSync) / 1000)}s ago` : "—", color: "var(--status-error)" }]
      : source === "connecting" ? [{ icon: <RefreshCw className="h-3 w-3" />, label: "Connecting…", detail: "Attempting Tuya IoT connection", time: "Now", color: "var(--status-warning)" }]
      : [{ icon: <Info className="h-3 w-3" />, label: "Simulation Mode", detail: "No Tuya credentials configured", time: "—", color: "var(--status-info)" }]),
    ...alerts,
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg-page)]/98 backdrop-blur-sm">
          <div className="absolute inset-0 -z-10" style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-page)]/90 px-5 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded border border-[var(--status-online)]/20 bg-[var(--status-online)]/5">
                <Bell className="h-4 w-4" style={{ color: "var(--status-online)" }} />
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wider" style={{ color: "var(--status-online)", fontFamily: "var(--font-sans)" }}>ALERTS & EVENTS</div>
                <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>System Notifications</div>
              </div>
            </div>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded border border-[var(--border-default)] bg-[var(--muted)] transition-all hover:border-[var(--status-error)]/20 hover:bg-[var(--status-error)]/5">
              <X className="h-4 w-4 text-[var(--text-muted)]" />
            </button>
          </header>
          <main className="mx-auto max-w-[800px] px-5 py-10">
            <div className="space-y-2">
              {liveAlerts.map((alert, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }} className="flex items-center justify-between rounded-lg border border-[var(--border-default)] bg-[var(--muted)] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded border" style={{ borderColor: `${alert.color}20`, background: `${alert.color}10`, color: alert.color }}>{alert.icon}</span>
                    <div>
                      <div className="text-[12px] font-semibold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-mono)" }}>{alert.label}</div>
                      <div className="text-[10px] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>{alert.detail}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">{alert.time}</span>
                </motion.div>
              ))}
            </div>
            {liveAlerts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Bell className="h-8 w-8 mb-3 text-[var(--text-muted)]" />
                <p className="text-[11px] text-[var(--text-muted)]" style={{ fontFamily: "var(--font-mono)" }}>No alerts. System is operational.</p>
              </div>
            )}
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
