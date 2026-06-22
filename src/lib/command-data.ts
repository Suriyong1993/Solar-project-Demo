import { useEffect, useState } from "react";

export type SeriesPoint = {
  t: number;
  solar: number;
  load: number;
  battery: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function seedSeries(): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = (i + 6) % 24;
    const sun = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
    out.push({
      t: hour,
      solar: +(sun * 5.4 + Math.random() * 0.3).toFixed(2),
      load: +(1 + Math.random() * 1.2 + (hour > 17 ? 0.8 : 0)).toFixed(2),
      battery: +(55 + sun * 35 + Math.random() * 3).toFixed(1),
    });
  }
  return out;
}

export function useLiveMetrics() {
  const [state, setState] = useState(() => ({
    solarKw: 4.8,
    batteryPct: 78,
    loadKw: 1.2,
    gridKw: 0.0,
    series: seedSeries(),
  }));

  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => {
        const solarKw = +clamp(s.solarKw + (Math.random() - 0.5) * 0.25, 3.2, 6.1).toFixed(2);
        const loadKw = +clamp(s.loadKw + (Math.random() - 0.5) * 0.2, 0.6, 2.6).toFixed(2);
        const batteryPct = +clamp(s.batteryPct + (Math.random() - 0.45) * 0.3, 55, 99).toFixed(1);
        const gridKw = +clamp(s.gridKw + (Math.random() - 0.55) * 0.3, 0, 1.5).toFixed(2);
        const last = s.series[s.series.length - 1];
        const series = [
          ...s.series.slice(1),
          { t: (last.t + 1) % 24, solar: solarKw, load: loadKw, battery: batteryPct },
        ];
        return { solarKw, batteryPct, loadKw, gridKw, series };
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return state;
}
