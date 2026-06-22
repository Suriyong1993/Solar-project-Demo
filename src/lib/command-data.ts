import { useEffect, useState } from "react";

export type SeriesPoint = {
  t: number;
  solar: number;
  load: number;
  battery: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Deterministic seed series to avoid SSR/client hydration drift in any consumer.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedSeries(): SeriesPoint[] {
  const r = mulberry32(20350622);
  const out: SeriesPoint[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = (i + 6) % 24;
    const sun = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
    out.push({
      t: hour,
      solar: +(sun * 5.4 + r() * 0.3).toFixed(2),
      load: +(1 + r() * 1.2 + (hour > 17 ? 0.8 : 0)).toFixed(2),
      battery: +(55 + sun * 35 + r() * 3).toFixed(1),
    });
  }
  return out;
}

export type Metrics = {
  solarKw: number;
  batteryPct: number;
  loadKw: number;
  /** Net battery power in kW. Positive = charging, negative = discharging. */
  batteryFlowKw: number;
  /** Estimated runtime hours at current load (when discharging). */
  runtimeHours: number;
  series: SeriesPoint[];
};

// Assume a 5 kWh usable battery bank for runtime estimation.
const BANK_KWH = 5;

export function useLiveMetrics(): Metrics {
  const [state, setState] = useState<Metrics>(() => ({
    solarKw: 4.8,
    batteryPct: 78,
    loadKw: 1.2,
    batteryFlowKw: 3.6,
    runtimeHours: (5 * 0.78) / 1.2,
    series: seedSeries(),
  }));

  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => {
        const solarKw = +clamp(s.solarKw + (Math.random() - 0.5) * 0.25, 3.2, 6.1).toFixed(2);
        const loadKw = +clamp(s.loadKw + (Math.random() - 0.5) * 0.2, 0.6, 2.6).toFixed(2);
        const net = solarKw - loadKw; // positive => charging
        const drift = (net / 6) * 0.4; // gentle SOC drift per tick
        const batteryPct = +clamp(s.batteryPct + drift, 20, 100).toFixed(1);
        const batteryFlowKw = +net.toFixed(2);
        const runtimeHours =
          loadKw > 0 ? +((BANK_KWH * (batteryPct / 100)) / Math.max(loadKw - Math.max(solarKw, 0), 0.05)).toFixed(1) : 99;
        const last = s.series[s.series.length - 1];
        const series = [
          ...s.series.slice(1),
          { t: (last.t + 1) % 24, solar: solarKw, load: loadKw, battery: batteryPct },
        ];
        return { solarKw, batteryPct, loadKw, batteryFlowKw, runtimeHours, series };
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return state;
}
