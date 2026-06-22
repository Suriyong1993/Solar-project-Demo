import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Battery, Clock, Home, Sun } from "lucide-react";
import { AtmosphereBackground } from "@/components/command/AtmosphereBackground";
import { TopNav } from "@/components/command/TopNav";
import { MetricCard } from "@/components/command/MetricCard";
import { EnergyScene } from "@/components/command/EnergyScene";
import { BatteryWidget } from "@/components/command/BatteryWidget";
import { EnergyGraph } from "@/components/command/EnergyGraph";
import { WeatherWidget } from "@/components/command/WeatherWidget";
import { useLiveMetrics } from "@/lib/command-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solar-X — Energy Command Center" },
      { name: "description", content: "Real-time solar, battery, and grid intelligence for the modern home. Watch every watt move from panel to battery in real time." },
      { property: "og:title", content: "Solar-X — Energy Command Center" },
      { property: "og:description", content: "Real-time solar, battery, and grid intelligence for the modern home." },
    ],
  }),
  component: Index,
});

function Index() {
  const m = useLiveMetrics();

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <AtmosphereBackground />
      <TopNav />

      {/* HERO */}
      <section className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-4 pt-10 pb-16 md:px-8 md:pt-14 lg:grid-cols-[5fr_7fr] lg:gap-8">
        {/* LEFT */}
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3 py-1.5"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-300" />
            </span>
            <span className="font-display text-[11px] font-medium tracking-[0.22em] text-amber-200">LIVE · MPPT 6096</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display mt-6 text-5xl font-semibold leading-[0.95] tracking-tight text-white md:text-6xl lg:text-7xl"
          >
            Your Home,<br />
            <span className="text-glow-solar">Powered by the Sun.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-md text-[17px] leading-relaxed text-slate-300/80"
          >
            Watch every watt move from panel to battery to home in real time. A command center designed for the next decade of clean energy.
          </motion.p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5">
            <MetricCard
              accent="solar"
              index={0}
              icon={<Sun className="h-4 w-4" strokeWidth={2.4} />}
              label="Solar Input"
              value={m.solarKw.toFixed(2)}
              unit="kW"
              delta="+12.4% today"
            />
            <MetricCard
              accent="leaf"
              index={1}
              icon={<Battery className="h-4 w-4" strokeWidth={2.4} />}
              label="Battery"
              value={m.batteryPct.toFixed(0)}
              unit="%"
              delta={m.batteryFlowKw >= 0 ? `Charging · ${m.batteryFlowKw.toFixed(2)} kW` : `Discharging · ${Math.abs(m.batteryFlowKw).toFixed(2)} kW`}
            />
            <MetricCard
              accent="violet"
              index={2}
              icon={<Home className="h-4 w-4" strokeWidth={2.4} />}
              label="DC Load"
              value={m.loadKw.toFixed(2)}
              unit="kW"
              delta="Steady"
            />
            <MetricCard
              accent="sky"
              index={3}
              icon={<Clock className="h-4 w-4" strokeWidth={2.4} />}
              label="Runtime"
              value={m.runtimeHours > 24 ? "24+" : m.runtimeHours.toFixed(1)}
              unit="h"
              delta={m.batteryFlowKw >= 0 ? "Net positive" : "Battery feeding load"}
            />
          </div>
        </div>

        {/* RIGHT — scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <EnergyScene solarKw={m.solarKw} batteryPct={m.batteryPct} loadKw={m.loadKw} batteryFlowKw={m.batteryFlowKw} />
        </motion.div>
      </section>

      {/* WIDGETS GRID */}
      <section className="mx-auto max-w-[1400px] px-4 pb-16 md:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[7fr_5fr]">
          <EnergyGraph data={m.series} />
          <div className="grid grid-cols-1 gap-6">
            <BatteryWidget batteryPct={m.batteryPct} />
            <WeatherWidget />
          </div>
        </div>
      </section>

      {/* STATUS STRIP */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-[1400px] px-4 pb-10 md:px-8"
      >
        <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
          <span>System · Nominal</span>
          <span className="hidden md:inline">Inverter · 96.4% efficiency</span>
          <span className="hidden md:inline">Last sync · just now</span>
          <span className="text-amber-200">Solar-X · v2.6</span>
        </div>
      </motion.footer>
    </div>
  );
}
