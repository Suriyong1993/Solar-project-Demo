import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Wifi, WifiOff, Info, RefreshCw, Sun } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  source: string;
  lastSync: number;
};

const alerts = [
  {
    icon: <Sun className="h-3 w-3" />,
    label: "System Initialized",
    detail: "Solar Monitor dashboard started",
    time: "Now",
    color: "#2dd4bf",
  },
];

export function AlertsPanel({ isOpen, onClose, source, lastSync }: Props) {
  const liveAlerts = [
    ...(source === "tuya"
      ? [
          {
            icon: <Wifi className="h-3 w-3" />,
            label: "Tuya Connected",
            detail: "Live data stream active",
            time: lastSync ? `${Math.floor((Date.now() - lastSync) / 1000)}s ago` : "Just now",
            color: "#2dd4bf",
          },
        ]
      : source === "offline"
        ? [
            {
              icon: <WifiOff className="h-3 w-3" />,
              label: "Tuya Offline",
              detail: "Falling back to simulation",
              time: lastSync ? `${Math.floor((Date.now() - lastSync) / 1000)}s ago` : "—",
              color: "#dc4446",
            },
          ]
        : source === "connecting"
          ? [
              {
                icon: <RefreshCw className="h-3 w-3" />,
                label: "Connecting...",
                detail: "Attempting Tuya IoT connection",
                time: "Now",
                color: "#d4a032",
              },
            ]
          : [
              {
                icon: <Info className="h-3 w-3" />,
                label: "Simulation Mode",
                detail: "No Tuya credentials configured",
                time: "—",
                color: "#d4a032",
              },
            ]),
    ...alerts,
  ];

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
              <div className="grid h-8 w-8 place-items-center rounded border border-[#2dd4bf]/20 bg-[#2dd4bf]/5">
                <Bell className="h-4 w-4 text-[#2dd4bf]" />
              </div>
              <div>
                <div
                  className="text-xs font-semibold tracking-wider"
                  style={{ color: "#2dd4bf", fontFamily: "Chakra Petch" }}
                >
                  ALERTS & EVENTS
                </div>
                <div
                  className="text-[9px] uppercase tracking-widest"
                  style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                >
                  System Notifications
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
            <div className="space-y-2">
              {liveAlerts.map((alert, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.01] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-7 w-7 place-items-center rounded border"
                      style={{
                        borderColor: `${alert.color}20`,
                        background: `${alert.color}10`,
                        color: alert.color,
                      }}
                    >
                      {alert.icon}
                    </span>
                    <div>
                      <div
                        className="text-[11px] font-semibold"
                        style={{ color: "#e2e2e8", fontFamily: "JetBrains Mono" }}
                      >
                        {alert.label}
                      </div>
                      <div
                        className="text-[9px]"
                        style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                      >
                        {alert.detail}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono" style={{ color: "#3a3a4a" }}>
                    {alert.time}
                  </span>
                </motion.div>
              ))}
            </div>

            {liveAlerts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Bell className="h-8 w-8 mb-3" style={{ color: "#3a3a4a" }} />
                <p
                  className="text-[11px]"
                  style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                >
                  No alerts. System is operational.
                </p>
              </div>
            )}
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
