import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { AtmosphereBackground } from "@/components/command/AtmosphereBackground";
import { TopNav } from "@/components/command/TopNav";
import { StatusBar } from "@/components/command/StatusBar";
import { HeroMetric } from "@/components/command/HeroMetric";
import { KpiStrip } from "@/components/command/KpiStrip";
import { EnergyFlowNetwork } from "@/components/command/EnergyFlowNetwork";
import { EnergyGraph } from "@/components/command/EnergyGraph";
import { AIInsights } from "@/components/command/AIInsights";
import { FloatingNav } from "@/components/command/FloatingNav";
import { BatteryWidget } from "@/components/command/BatteryWidget";
import { WeatherWidget } from "@/components/command/WeatherWidget";
import { AlertsPanel } from "@/components/command/AlertsPanel";
import { SettingsPanel } from "@/components/command/SettingsPanel";
import { useLiveMetrics } from "@/lib/tuya-integration";
import { deriveMetrics } from "@/lib/derived-metrics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Radiant Core — Energy Command Center" },
      { name: "description", content: "World-class premium energy operating system with real-time AI-powered solar monitoring and control." },
    ],
  }),
  component: Index,
});

function Index() {
  const m = useLiveMetrics();
  const [activeTab, setActiveTab] = useState("home");
  const currentHour = new Date().getHours();

  const d = useMemo(() => deriveMetrics(m, m.tuya?.source ?? "simulation", m.tuya?.mpptEfficiency), [m]);

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-28">
      <AtmosphereBackground />
      <TopNav tuya={m.tuya} />

      <section className="mx-auto max-w-[1400px] px-4 pt-6 md:px-8">
        <StatusBar tuya={m.tuya} isCharging={m.isCharging} />
        <HeroMetric solarKw={m.solarKw} peakKw={m.peakKw} todayKwh={m.todayKwh} />
        <div className="mt-4">
          <KpiStrip
            batteryPct={m.batteryPct}
            isCharging={m.isCharging}
            loadKw={m.loadKw}
            batteryNetW={m.batteryNetW}
            todayKwh={m.todayKwh}
            efficiencyPct={d.efficiencyPct}
          />
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-4 md:px-8 mt-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col"
            style={{ minHeight: "480px" }}
          >
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="label-xs flex items-center gap-2">
                <span className="dot bg-[var(--accent)]" />
                Live Network Topology
              </h2>
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[var(--muted)] border border-[var(--border-default)]">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: m.isCharging ? "var(--status-online)" : "var(--energy-solar)" }}>
                  {m.isCharging ? "CHARGING ACTIVE" : "DISCHARGING"}
                </span>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: m.isCharging ? "var(--status-online)" : "var(--energy-solar)" }} />
              </div>
            </div>
            <div className="w-full flex-1 flex items-center justify-center relative z-10">
              <div className="w-full max-w-2xl" style={{ aspectRatio: "16/9" }}>
                <EnergyFlowNetwork
                  solarKw={m.solarKw}
                  batteryPct={m.batteryPct}
                  loadKw={m.loadKw}
                  batteryFlowKw={m.batteryFlowKw}
                  isCharging={m.isCharging}
                  mpptEfficiencyPct={d.mpptEfficiencyPct}
                />
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col gap-6">
            <EnergyGraph data={m.series} />
            <AIInsights
              solarKw={m.solarKw}
              batteryPct={m.batteryPct}
              loadKw={m.loadKw}
              isCharging={m.isCharging}
              todayKwh={m.todayKwh}
              runtimeHours={m.runtimeHours}
              currentHour={currentHour}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr_1.5fr]">
          <BatteryWidget
            batteryPct={m.batteryPct}
            isCharging={m.isCharging}
            batteryNetW={m.batteryNetW}
            todayKwh={m.todayKwh}
            runtimeHours={m.runtimeHours}
          />
          <WeatherWidget peakKw={m.peakKw} />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-strong rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none" style={{ background: "var(--energy-load)" }} />
            <h3 className="label-xs mb-6 relative z-10">System Impact</h3>
            <div className="grid grid-cols-2 gap-4 flex-1 relative z-10">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider">Energy Generated</span>
                <span className="text-xl font-black text-[var(--energy-solar)]">{m.todayKwh.toFixed(1)} <span className="text-xs">kWh</span></span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider">Financial Savings</span>
                <span className="text-xl font-black text-[var(--status-online)]">${d.savingsUsd.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] tracking-wider">System Uptime</span>
                <span className="text-xl font-black text-[var(--status-info)]">{d.uptime.value} <span className="text-xs">{d.uptime.unit}</span></span>
              </div>
            </div>
            <div className="mt-6 rounded-2xl p-5 flex items-center justify-between relative z-10"
              style={{
                background: "linear-gradient(135deg, color-mix(in srgb, var(--energy-load) 10%, transparent), color-mix(in srgb, var(--status-online) 5%, transparent))",
                border: "1px solid color-mix(in srgb, var(--energy-load) 15%, transparent)",
                boxShadow: "0 0 20px color-mix(in srgb, var(--energy-load) 10%, transparent)",
              }}>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--energy-load)] mb-1">Carbon Avoided</span>
              </div>
              <div className="text-3xl font-black text-[var(--text-primary)] number-glow">{d.co2SavedKg} <span className="text-sm">kg</span></div>
            </div>
          </motion.div>
        </div>
      </div>

      <FloatingNav activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence>
        {activeTab === "alerts" && (
          <AlertsPanel
            isOpen={true}
            onClose={() => setActiveTab("home")}
            source={m.tuya?.source ?? "simulation"}
            lastSync={m.tuya?.lastSync ?? 0}
          />
        )}
        {activeTab === "settings" && (
          <SettingsPanel
            isOpen={true}
            onClose={() => setActiveTab("home")}
            source={m.tuya?.source ?? "simulation"}
            lastSync={m.tuya?.lastSync ?? 0}
            deviceId={m.tuya?.deviceId ?? ""}
            onReconnect={() => window.location.reload()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
