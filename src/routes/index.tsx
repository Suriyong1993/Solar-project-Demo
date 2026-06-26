import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sun,
  Battery,
  Home,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Leaf,
  Activity,
} from "lucide-react";
import { useState, useMemo } from "react";
import { AtmosphereBackground } from "@/components/command/AtmosphereBackground";
import { TopNav } from "@/components/command/TopNav";
import { EnergyFlowNetwork } from "@/components/command/EnergyFlowNetwork";
import { AIInsights } from "@/components/command/AIInsights";
import { FloatingNav } from "@/components/command/FloatingNav";
import { BatteryWidget } from "@/components/command/BatteryWidget";
import { EnergyGraph } from "@/components/command/EnergyGraph";
import { WeatherWidget } from "@/components/command/WeatherWidget";
import { useLiveMetrics } from "@/lib/tuya-integration";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Radiant Core — Energy Command Center" },
      {
        name: "description",
        content:
          "World-class premium energy operating system with real-time AI-powered solar monitoring and control.",
      },
    ],
  }),
  component: Index,
});

type MetricCardData = {
  id: string;
  label: string;
  value: string;
  unit: string;
  delta: string;
  color: string;
  icon: React.ReactNode;
};

function Index() {
  const m = useLiveMetrics();
  const [activeTab, setActiveTab] = useState("home");
  const currentHour = new Date().getHours();

  const kpiCards: MetricCardData[] = useMemo(
    () => [
      {
        id: "solar",
        label: "Solar Gen",
        value: m.solarKw.toFixed(2),
        unit: "kW",
        delta: m.solarKw > 0.1 ? "ACTIVE" : "STANDBY",
        color: "#f59e0b",
        icon: <Sun className="h-6 w-6" />,
      },
      {
        id: "battery",
        label: "Battery",
        value: m.batteryPct.toFixed(0),
        unit: "%",
        delta: m.isCharging ? "CHARGING" : "DRAINING",
        color: "#00f593",
        icon: <Battery className="h-6 w-6" />,
      },
      {
        id: "load",
        label: "Home Load",
        value: m.loadKw.toFixed(2),
        unit: "kW",
        delta: m.loadKw < 1.5 ? "ECO" : "HIGH",
        color: "#a855f7",
        icon: <Home className="h-6 w-6" />,
      },
      {
        id: "net",
        label: "Net Flow",
        value: `${m.isCharging ? "+" : "-"}${m.batteryNetW}`,
        unit: "W",
        delta: m.isCharging ? "SURPLUS" : "DEFICIT",
        color: m.isCharging ? "#00f593" : "#ff3b5c",
        icon: m.isCharging ? (
          <TrendingUp className="h-6 w-6" />
        ) : (
          <TrendingDown className="h-6 w-6" />
        ),
      },
      {
        id: "efficiency",
        label: "Efficiency",
        value: `${(m.solarKw > 0 ? (m.solarKw / 5.8) * 100 : 0).toFixed(0)}`,
        unit: "%",
        delta: "OPTIMAL",
        color: "#00d4ff",
        icon: <Activity className="h-6 w-6" />,
      },
      {
        id: "savings",
        label: "CO₂ Saved",
        value: (m.todayKwh * 0.7).toFixed(1),
        unit: "kg",
        delta: "TODAY",
        color: "#00f593",
        icon: <Leaf className="h-6 w-6" />,
      },
      {
        id: "energy",
        label: "Daily Yield",
        value: m.todayKwh.toFixed(1),
        unit: "kWh",
        delta: "SO FAR",
        color: "#f59e0b",
        icon: <TrendingUp className="h-6 w-6" />,
      },
      {
        id: "carbon",
        label: "Saved",
        value: `$${(m.todayKwh * 0.12).toFixed(2)}`,
        unit: "USD",
        delta: "TODAY",
        color: "#a855f7",
        icon: <PiggyBank className="h-6 w-6" />,
      },
    ],
    [m],
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-28">
      <AtmosphereBackground />
      <TopNav tuya={m.tuya} />

      {/* Hero — System Status Bar */}
      <section className="mx-auto max-w-[1400px] px-4 pt-8 md:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center gap-3 mb-5"
        >
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{
              backgroundColor: "rgba(0,245,147,0.1)",
              border: "1px solid rgba(0,245,147,0.2)",
              color: "#00f593",
              boxShadow: "0 0 15px rgba(0,245,147,0.1)",
            }}
          >
            <span className="dot animate-ping" style={{ color: "#00f593" }} />
            Systems Nominal
          </span>
          <span
            className="rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{
              backgroundColor: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.2)",
              color: "#00d4ff",
            }}
          >
            AI Engine Active
          </span>
          {m.isCharging && (
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-1.5"
              style={{
                backgroundColor: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.25)",
                color: "#f59e0b",
                boxShadow: "0 0 15px rgba(245,158,11,0.15)",
              }}
            >
              <Sun className="h-3 w-3" /> Peak Charging
            </motion.span>
          )}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl text-[#e8e8f0]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Energy Command
          <span 
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(90deg, #00d4ff, #00f593)" }}
          >
            {" "}Center
          </span>
        </motion.h1>
      </section>

      {/* Main Container for larger desktop layouts */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 mt-8 flex flex-col gap-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
          {kpiCards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 * i, type: "spring", stiffness: 80 }}
              className="glass group relative rounded-[28px] p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-default"
              style={{ borderColor: `${card.color}20` }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(150px at 50% 0%, ${card.color}15, transparent)`,
                }}
              />
              {/* Border glow on hover */}
              <div className="absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 border"
                style={{ borderColor: `${card.color}40`, boxShadow: `0 0 20px ${card.color}20 inset` }}
              />

              <div className="relative z-10 flex flex-col h-full justify-between gap-3">
                <div className="flex items-center justify-between">
                  <div
                    className="grid h-10 w-10 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${card.color}15`,
                      color: card.color,
                      boxShadow: `0 0 15px ${card.color}20`,
                    }}
                  >
                    {card.icon}
                  </div>
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-1 rounded-full"
                    style={{ backgroundColor: `${card.color}10`, color: card.color }}
                  >
                    {card.delta}
                  </span>
                </div>
                <div>
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.15em]"
                    style={{ color: "#8e8ea0" }}
                  >
                    {card.label}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span
                      className="text-3xl font-black tabular-nums transition-all duration-500"
                      style={{
                        color: "#ffffff",
                        textShadow: `0 0 20px ${card.color}40`,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {card.value}
                    </span>
                    <span className="text-[12px] font-bold" style={{ color: card.color }}>{card.unit}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Network & Graphs Row */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
          
          {/* Main — Energy Flow Network */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-strong rounded-[36px] p-6 md:p-8 relative overflow-hidden flex flex-col"
            style={{ minHeight: "480px" }}
          >
            {/* Ambient Background Glow */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${m.isCharging ? "#00f593" : "#f59e0b"} 0%, transparent 60%)`,
                filter: "blur(80px)"
              }}
            />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#e8e8f0] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]" />
                Live Network Topology
              </h2>
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-black/20 rounded-full border border-white/5">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: m.isCharging ? "#00f593" : "#f59e0b" }}>
                  {m.isCharging ? "CHARGING ACTIVE" : "DISCHARGING"}
                </span>
                <span
                  className="w-2 h-2 rounded-full animate-ping"
                  style={{ backgroundColor: m.isCharging ? "#00f593" : "#f59e0b" }}
                />
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
                />
              </div>
            </div>
          </motion.div>

          {/* Right Column: Graphs & AI */}
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

        {/* Bottom Row: Weather & Battery */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr_1.5fr]">
          <BatteryWidget
            batteryPct={m.batteryPct}
            isCharging={m.isCharging}
            batteryNetW={m.batteryNetW}
            todayKwh={m.todayKwh}
            runtimeHours={m.runtimeHours}
          />
          <WeatherWidget peakKw={m.peakKw} />

          {/* Environmental Impact Summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-strong rounded-[32px] p-6 flex flex-col justify-between relative overflow-hidden"
          >
            <div 
              className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
              style={{ background: "#00d4ff" }}
            />

            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#e8e8f0] mb-6 relative z-10">
              System Impact
            </h3>

            <div className="grid grid-cols-2 gap-4 flex-1 relative z-10">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-[#8e8ea0] tracking-wider">Energy Generated</span>
                <span className="text-xl font-black text-[#f59e0b]">{m.todayKwh.toFixed(1)} <span className="text-xs">kWh</span></span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-[#8e8ea0] tracking-wider">Energy Consumed</span>
                <span className="text-xl font-black text-[#a855f7]">{(m.loadKw * 12).toFixed(1)} <span className="text-xs">kWh</span></span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-[#8e8ea0] tracking-wider">Financial Savings</span>
                <span className="text-xl font-black text-[#00f593]">${(m.todayKwh * 0.15).toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase text-[#8e8ea0] tracking-wider">System Uptime</span>
                <span className="text-xl font-black text-[#00d4ff]">{(m.runtimeHours > 24 ? m.runtimeHours / 24 : m.runtimeHours).toFixed(1)} <span className="text-xs">{m.runtimeHours > 24 ? "days" : "hrs"}</span></span>
              </div>
            </div>

            <div
              className="mt-6 rounded-[24px] p-5 flex items-center justify-between relative z-10"
              style={{
                background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,245,147,0.05))",
                border: "1px solid rgba(0,212,255,0.15)",
                boxShadow: "0 0 20px rgba(0,212,255,0.1)",
              }}
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00d4ff] mb-1">
                  Carbon Avoided
                </span>
                <span className="text-[11px] font-medium text-[#8e8ea0]">Equivalent to planting 3 trees</span>
              </div>
              <div className="text-3xl font-black text-white number-glow">
                {Math.round(m.todayKwh * 0.7)} <span className="text-sm">kg</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <FloatingNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
