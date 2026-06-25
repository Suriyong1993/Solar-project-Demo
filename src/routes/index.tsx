import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Battery, Home, Sun, Zap, Cpu, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useMemo, lazy, Suspense, type ComponentType } from "react";
import { AtmosphereBackground } from "@/components/command/AtmosphereBackground";
import { TopNav } from "@/components/command/TopNav";
import { MetricCard } from "@/components/command/MetricCard";

const EnergyScene = lazy(() =>
  import("@/components/command/EnergyScene").then((m) => ({
    default: m.EnergyScene as unknown as ComponentType<Record<string, unknown>>,
  })),
);
import { BatteryWidget } from "@/components/command/BatteryWidget";
import { EnergyGraph } from "@/components/command/EnergyGraph";
import { WeatherWidget } from "@/components/command/WeatherWidget";
import { InsightsStrip, type InsightsData } from "@/components/command/InsightsStrip";
import { useLiveMetrics } from "@/lib/tuya-integration";
import { SolerieuSpecOverlay } from "@/components/command/SolerieuSpecOverlay";
import { AlertsPanel } from "@/components/command/AlertsPanel";
import { SettingsPanel } from "@/components/command/SettingsPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solar Monitor — MPPT Telemetry" },
      {
        name: "description",
        content: "Real-time solar, battery, and grid telemetry dashboard with 3D visualization.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const m = useLiveMetrics();
  const [specsOpen, setSpecsOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>("controller");

  const insightsData: InsightsData = {
    todayKwh: m.todayKwh,
    runtimeHours: m.runtimeHours,
    peakKw: m.peakKw,
    batteryPct: m.batteryPct,
    isCharging: m.isCharging,
    currentHour: new Date().getHours(),
    series: m.series,
  };

  const getSelectedNodeDetails = () => {
    switch (selectedNode) {
      case "solar":
        return {
          title: "SOLAR ARRAY",
          subtitle: "MPPT Photovoltaic Input",
          icon: <Sun className="h-4 w-4" style={{ color: "#d4a032" }} />,
          borderColor: "rgba(212,160,50,0.2)",
          textColor: "#d4a032",
          stats: [
            { label: "Current Output", value: `${m.solarKw.toFixed(2)} kW` },
            { label: "Daily Peak", value: `${(m.peakKw * 1000).toFixed(0)} W` },
            {
              label: "Efficiency",
              value: `${(m.solarKw > 0 ? (m.solarKw / 5.8) * 100 : 0).toFixed(1)}%`,
            },
            { label: "Status", value: m.solarKw > 0.1 ? "GENERATING" : "STANDBY" },
          ],
        };
      case "battery":
        return {
          title: "BATTERY BANK",
          subtitle: "LiFePO4 Storage",
          icon: <Battery className="h-4 w-4" style={{ color: "#2dd4bf" }} />,
          borderColor: "rgba(45,212,191,0.2)",
          textColor: "#2dd4bf",
          stats: [
            { label: "State of Charge", value: `${m.batteryPct.toFixed(0)}%` },
            { label: "Net Power", value: `${m.isCharging ? "+" : "-"}${m.batteryNetW} W` },
            {
              label: "Runtime",
              value: m.runtimeHours > 24 ? "24+ hrs" : `${m.runtimeHours.toFixed(1)} hrs`,
            },
            { label: "Temperature", value: "—" },
          ],
        };
      case "load":
        return {
          title: "CIRCUIT LOAD",
          subtitle: "Home Demand Center",
          icon: <Home className="h-4 w-4" style={{ color: "#60a5fa" }} />,
          borderColor: "rgba(96,165,250,0.2)",
          textColor: "#60a5fa",
          stats: [
            { label: "Real-time", value: `${m.loadKw.toFixed(2)} kW` },
            { label: "Mode", value: m.loadKw < 1.5 ? "ECONOMY" : "NORMAL" },
            { label: "Phase", value: "SINGLE" },
            { label: "Health", value: "STABLE" },
          ],
        };
      case "controller":
      default:
        return {
          title: "MPPT CONTROLLER",
          subtitle: "HM-6096 Core",
          icon: <Cpu className="h-4 w-4" style={{ color: "#e2e2e8" }} />,
          borderColor: "rgba(226,226,232,0.15)",
          textColor: "#e2e2e8",
          stats: [
            {
              label: "Efficiency",
              value: m.tuya?.mpptEfficiency ? `${m.tuya.mpptEfficiency.toFixed(1)}%` : "—",
            },
            { label: "Source", value: m.tuya?.source === "tuya" ? "Tuya IoT" : "Simulation" },
            { label: "CPU Load", value: "—" },
            { label: "Firmware", value: "—" },
          ],
        };
    }
  };

  const selectedDetails = useMemo(getSelectedNodeDetails, [
    selectedNode,
    m.solarKw,
    m.batteryPct,
    m.loadKw,
    m.batteryNetW,
    m.isCharging,
    m.peakKw,
    m.runtimeHours,
    m.tuya,
  ]);

  return (
    <div className="relative min-h-screen overflow-x-hidden text-[#e2e2e8]">
      <AtmosphereBackground />
      <TopNav
        tuya={m.tuya}
        onOpenSpecs={() => setSpecsOpen(true)}
        onOpenAlerts={() => setAlertsOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <SolerieuSpecOverlay isOpen={specsOpen} onClose={() => setSpecsOpen(false)} />
      <AlertsPanel
        isOpen={alertsOpen}
        onClose={() => setAlertsOpen(false)}
        source={m.tuya?.source ?? "simulation"}
        lastSync={m.tuya?.lastSync ?? 0}
      />
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        source={m.tuya?.source ?? "simulation"}
        lastSync={m.tuya?.lastSync ?? 0}
        deviceId={m.tuya?.deviceId ?? ""}
        onReconnect={() => {
          setSettingsOpen(false);
          // Trigger refetch by unmounting and remounting the main component
          window.location.reload();
        }}
      />

      {/* Header — clean, minimal */}
      <section className="mx-auto max-w-[1400px] px-4 pt-8 pb-3 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded border border-[#d4a032]/15 bg-[#d4a032]/5 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "#d4a032", fontFamily: "JetBrains Mono" }}
            >
              <span className="status-dot" style={{ color: "#2dd4bf" }} />
              SYSTEM ONLINE
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
              style={{ fontFamily: "Chakra Petch", color: "#e2e2e8" }}
            >
              Energy Telemetry
            </motion.h1>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[11px] leading-relaxed max-w-sm border-l border-white/[0.06] pl-4 py-1"
            style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
          >
            3D WebGL visualization. Rotate, zoom, and inspect system nodes in real time.
          </motion.div>
        </div>
      </section>

      {/* Metric cards */}
      <section className="mx-auto max-w-[1400px] px-4 pb-4 md:px-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            index={0}
            icon={<Sun className="h-4 w-4" />}
            label="Solar Power"
            value={m.solarKw.toFixed(2)}
            unit="kW"
            delta={m.solarKw > 0.1 ? "ACTIVE" : "STANDBY"}
            accent="amber"
          />
          <MetricCard
            index={1}
            icon={<Battery className="h-4 w-4" />}
            label="Battery SOC"
            value={m.batteryPct.toFixed(0)}
            unit="%"
            delta={m.isCharging ? "CHARGING" : "DRAIN"}
            accent="teal"
          />
          <MetricCard
            index={2}
            icon={<Home className="h-4 w-4" />}
            label="Load Draw"
            value={m.loadKw.toFixed(2)}
            unit="kW"
            delta={m.loadKw < 1.5 ? "ECO MODE" : "PEAK"}
            accent="cool"
          />
          <MetricCard
            index={3}
            icon={
              m.isCharging ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )
            }
            label="Net Flow"
            value={`${m.isCharging ? "+" : "-"}${m.batteryNetW}`}
            unit="W"
            delta={m.isCharging ? "SURPLUS" : "DEFICIT"}
            accent={m.isCharging ? "teal" : "warm"}
          />
        </div>
      </section>

      {/* Main — 3D scene + inspector */}
      <section className="mx-auto max-w-[1400px] px-4 py-4 md:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_0.7fr]">
          {/* 3D Scene — lazy loaded to reduce initial bundle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Suspense
              fallback={
                <div className="h-[400px] w-full rounded-lg border border-white/[0.06] bg-[#050816] md:h-[560px]" />
              }
            >
              <EnergyScene
                solarKw={m.solarKw}
                batteryPct={m.batteryPct}
                loadKw={m.loadKw}
                batteryFlowKw={m.batteryFlowKw}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
              />
            </Suspense>
          </motion.div>

          {/* Inspector panel */}
          <div className="flex flex-col h-full justify-between gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedNode}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3 }}
                className="panel flex-1 rounded-lg p-5 flex flex-col justify-between"
                style={{ borderColor: selectedDetails.borderColor }}
              >
                <div>
                  {/* Title bar */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 place-items-center rounded-md border border-white/[0.06] bg-white/[0.02]">
                        {selectedDetails.icon}
                      </div>
                      <div>
                        <div
                          className="text-xs font-bold tracking-wider"
                          style={{ color: selectedDetails.textColor, fontFamily: "Chakra Petch" }}
                        >
                          {selectedDetails.title}
                        </div>
                        <div
                          className="text-[9px] uppercase tracking-[0.15em]"
                          style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                        >
                          {selectedDetails.subtitle}
                        </div>
                      </div>
                    </div>
                    <span
                      className="text-[9px] border border-white/[0.06] rounded px-1.5 py-0.5 bg-white/[0.02] uppercase tracking-widest"
                      style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                    >
                      LIVE
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    {selectedDetails.stats.map((stat, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-md border border-white/[0.04] bg-white/[0.01] px-3 py-2.5"
                      >
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wider"
                          style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                        >
                          {stat.label}
                        </span>
                        <span
                          className="text-sm font-bold tabular-nums"
                          style={{ color: selectedDetails.textColor, fontFamily: "JetBrains Mono" }}
                        >
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Node selector */}
            <div className="panel rounded-lg p-2 flex items-center justify-around">
              <NodePill
                active={selectedNode === "solar"}
                onClick={() => setSelectedNode("solar")}
                color="#d4a032"
                label="SOLAR"
              />
              <NodePill
                active={selectedNode === "controller"}
                onClick={() => setSelectedNode("controller")}
                color="#e2e2e8"
                label="MPPT"
              />
              <NodePill
                active={selectedNode === "battery"}
                onClick={() => setSelectedNode("battery")}
                color="#2dd4bf"
                label="BATT"
              />
              <NodePill
                active={selectedNode === "load"}
                onClick={() => setSelectedNode("load")}
                color="#60a5fa"
                label="LOAD"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Insights strip */}
      <section className="mx-auto max-w-[1400px] px-4 py-3 md:px-8">
        <InsightsStrip data={insightsData} />
      </section>

      {/* Details — charts + battery + weather */}
      <section className="mx-auto max-w-[1400px] px-4 pb-12 pt-3 md:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="grid grid-cols-1 gap-4">
            <EnergyGraph data={m.series} />
            <WeatherWidget peakKw={m.peakKw} />
          </div>
          <BatteryWidget
            batteryPct={m.batteryPct}
            isCharging={m.isCharging}
            batteryNetW={m.batteryNetW}
            todayKwh={m.todayKwh}
            runtimeHours={m.runtimeHours}
          />
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-[1400px] px-4 pb-8 md:px-8"
      >
        <div className="panel flex flex-wrap items-center justify-between gap-3 rounded-lg px-5 py-3">
          <span
            className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "#2dd4bf", fontFamily: "JetBrains Mono" }}
          >
            <span className="status-dot animate-ping-subtle" style={{ color: "#2dd4bf" }} />
            OPERATIONAL
          </span>
          <span
            className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] md:inline"
            style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
          >
            MPPT · {m.tuya?.mpptEfficiency ? m.tuya.mpptEfficiency.toFixed(1) : "—"}% EFF
          </span>
          <span
            className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] md:inline"
            style={{ color: "#2dd4bf", fontFamily: "JetBrains Mono" }}
          >
            OFF-GRID · ACTIVE
          </span>
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
          >
            v3.0 · WEBGL
          </span>
        </div>
      </motion.footer>
    </div>
  );
}

function NodePill({
  active,
  onClick,
  color,
  label,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded font-mono text-[10px] font-semibold uppercase tracking-wider transition-all duration-150"
      style={{
        background: active ? `${color}15` : "transparent",
        color: active ? color : "#6b6b7b",
        border: active ? `1px solid ${color}30` : "1px solid transparent",
        fontFamily: "JetBrains Mono",
      }}
    >
      {label}
    </button>
  );
}
