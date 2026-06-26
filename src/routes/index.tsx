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
        label: "Solar Generation",
        value: m.solarKw.toFixed(2),
        unit: "kW",
        delta: m.solarKw > 0.1 ? "GENERATING" : "STANDBY",
        color: "#f59e0b",
        icon: <Sun className="h-5 w-5" />,
      },
      {
        id: "battery",
        label: "Battery Reserve",
        value: m.batteryPct.toFixed(0),
        unit: "%",
        delta: m.isCharging ? "CHARGING" : "DRAINING",
        color: "#00f593",
        icon: <Battery className="h-5 w-5" />,
      },
      {
        id: "load",
        label: "Home Load",
        value: m.loadKw.toFixed(2),
        unit: "kW",
        delta: m.loadKw < 1.5 ? "ECO MODE" : "ACTIVE",
        color: "#a855f7",
        icon: <Home className="h-5 w-5" />,
      },
      {
        id: "net",
        label: "Net Flow",
        value: `${m.isCharging ? "+" : "-"}${m.batteryNetW}`,
        unit: "W",
        delta: m.isCharging ? "SURPLUS" : "DEFICIT",
        color: m.isCharging ? "#00f593" : "#ff3b5c",
        icon: m.isCharging ? (
          <TrendingUp className="h-5 w-5" />
        ) : (
          <TrendingDown className="h-5 w-5" />
        ),
      },
      {
        id: "efficiency",
        label: "Efficiency",
        value: `${(m.solarKw > 0 ? (m.solarKw / 5.8) * 100 : 0).toFixed(0)}`,
        unit: "%",
        delta: "OPTIMAL",
        color: "#00d4ff",
        icon: <Activity className="h-5 w-5" />,
      },
      {
        id: "savings",
        label: "CO₂ Saved",
        value: (m.todayKwh * 0.7).toFixed(1),
        unit: "kg",
        delta: "TODAY",
        color: "#00f593",
        icon: <Leaf className="h-5 w-5" />,
      },
      {
        id: "energy",
        label: "Today's Yield",
        value: m.todayKwh.toFixed(1),
        unit: "kWh",
        delta: m.todayKwh > 15 ? "ABOVE AVG" : "NORMAL",
        color: "#f59e0b",
        icon: <TrendingUp className="h-5 w-5" />,
      },
      {
        id: "carbon",
        label: "Carbon Offset",
        value: `$${(m.todayKwh * 0.12).toFixed(2)}`,
        unit: "saved",
        delta: "TODAY",
        color: "#a855f7",
        icon: <PiggyBank className="h-5 w-5" />,
      },
    ],
    [m],
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-24">
      <AtmosphereBackground />
      <TopNav tuya={m.tuya} />

      {/* Hero — System Status Bar */}
      <section className="mx-auto max-w-[1400px] px-4 pt-6 md:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center gap-2 mb-4"
        >
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.15em]"
            style={{
              backgroundColor: "rgba(0,245,147,0.1)",
              border: "1px solid rgba(0,245,147,0.15)",
              color: "#00f593",
            }}
          >
            <span className="dot animate-ping" style={{ color: "#00f593" }} />
            All Systems Nominal
          </span>
          <span
            className="rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.15em]"
            style={{
              backgroundColor: "rgba(0,212,255,0.05)",
              border: "1px solid rgba(0,212,255,0.1)",
              color: "#00d4ff",
            }}
          >
            AI Active
          </span>
          {m.isCharging && (
            <span
              className="rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.15em]"
              style={{
                backgroundColor: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.12)",
                color: "#f59e0b",
              }}
            >
              ☀️ Solar Charging
            </span>
          )}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-[#e8e8f0]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Energy Command
          <span className="text-[#00d4ff]"> Center</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-1 text-[12px] text-[#6b6b80] max-w-lg"
        >
          Real-time holographic energy network with AI-powered insights and predictive analytics.
        </motion.p>
      </section>

      {/* KPI Cards — 4-across on desktop, 2 on mobile */}
      <section className="mx-auto max-w-[1400px] px-4 py-5 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
          {kpiCards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              className="glass group relative rounded-[24px] p-4 overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-default"
              style={{ borderColor: `${card.color}15` }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(120px at 50% -20%, ${card.color}10, transparent)`,
                }}
              />

              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[8px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "#6b6b80" }}
                  >
                    {card.label}
                  </span>
                  <div
                    className="grid h-7 w-7 place-items-center rounded-full"
                    style={{
                      backgroundColor: `${card.color}10`,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-2xl font-bold tabular-nums transition-all duration-500"
                    style={{
                      color: card.color,
                      textShadow: `0 0 20px ${card.color}20`,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {card.value}
                  </span>
                  <span className="text-[10px] font-medium text-[#6b6b80] ml-0.5">{card.unit}</span>
                </div>
                <div
                  className="mt-2 text-[8px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: `${card.color}90` }}
                >
                  {card.delta}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main — Energy Flow Network (Hero) */}
      <section className="mx-auto max-w-[1400px] px-4 py-3 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-glow rounded-[36px] p-6 md:p-8 relative overflow-hidden"
        >
          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6b6b80]">
              <span className="text-[#00d4ff]">●</span> Energy Network
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-medium uppercase tracking-wider text-[#6b6b80]">
                {m.isCharging ? "CHARGING MODE" : "DISCHARGE MODE"}
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: m.isCharging ? "#00f593" : "#ff3b5c" }}
              />
            </div>
          </div>

          {/* The Energy Flow SVG */}
          <div className="w-full max-w-lg mx-auto" style={{ aspectRatio: "1" }}>
            <EnergyFlowNetwork
              solarKw={m.solarKw}
              batteryPct={m.batteryPct}
              loadKw={m.loadKw}
              batteryFlowKw={m.batteryFlowKw}
              isCharging={m.isCharging}
            />
          </div>
        </motion.div>
      </section>

      {/* AI Insights + Graph Row */}
      <section className="mx-auto max-w-[1400px] px-4 py-3 md:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <AIInsights
            solarKw={m.solarKw}
            batteryPct={m.batteryPct}
            loadKw={m.loadKw}
            isCharging={m.isCharging}
            todayKwh={m.todayKwh}
            runtimeHours={m.runtimeHours}
            currentHour={currentHour}
          />
          <EnergyGraph data={m.series} />
        </div>
      </section>

      {/* Battery + Weather Row */}
      <section className="mx-auto max-w-[1400px] px-4 py-3 md:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.7fr_0.5fr_0.8fr]">
          <BatteryWidget
            batteryPct={m.batteryPct}
            isCharging={m.isCharging}
            batteryNetW={m.batteryNetW}
            todayKwh={m.todayKwh}
            runtimeHours={m.runtimeHours}
          />
          <WeatherWidget peakKw={m.peakKw} />

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass rounded-[32px] p-5 flex flex-col justify-between"
          >
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6b6b80] mb-4">
              Daily Summary
            </h3>

            <div className="space-y-3 flex-1">
              <SummaryRow
                label="Energy Generated"
                value={`${m.todayKwh.toFixed(1)} kWh`}
                color="#f59e0b"
              />
              <SummaryRow
                label="Energy Consumed"
                value={`${(m.loadKw * 12).toFixed(1)} kWh`}
                color="#a855f7"
              />
              <SummaryRow
                label="Battery Cycles"
                value={`${m.isCharging ? "1.2" : "0.8"} cycles`}
                color="#00f593"
              />
              <SummaryRow
                label="Savings Today"
                value={`$${(m.todayKwh * 0.15).toFixed(2)}`}
                color="#00d4ff"
              />
              <SummaryRow
                label="CO₂ Avoided"
                value={`${(m.todayKwh * 0.7).toFixed(1)} kg`}
                color="#00f593"
              />
              <SummaryRow
                label="System Uptime"
                value={`${(m.runtimeHours > 24 ? m.runtimeHours / 24 : m.runtimeHours).toFixed(1)} ${m.runtimeHours > 24 ? "days" : "hrs"}`}
                color="#6b6b80"
              />
            </div>

            <div
              className="mt-4 rounded-[16px] p-3 text-center"
              style={{
                backgroundColor: "rgba(0,212,255,0.05)",
                border: "1px solid rgba(0,212,255,0.1)",
              }}
            >
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6b6b80]">
                Carbon Impact
              </span>
              <div className="text-xl font-bold text-[#00d4ff] number-glow mt-1">
                🌱 {Math.round(m.todayKwh * 0.7)} kg
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom Navigation */}
      <FloatingNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-medium text-[#6b6b80]">{label}</span>
      <span className="text-[12px] font-semibold tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
