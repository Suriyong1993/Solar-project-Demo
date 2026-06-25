import { useEffect, useState, useRef } from "react";

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

export type Metrics = {
  solarKw: number;
  batteryPct: number;
  loadKw: number;
  /** Net battery power in kW. Positive = charging, negative = discharging. */
  batteryFlowKw: number;
  /** Estimated runtime hours at current load (when discharging). */
  runtimeHours: number;
  series: SeriesPoint[];
  /** Today's total energy generated in kWh */
  todayKwh: number;
  /** Peak solar power today in kW */
  peakKw: number;
  /** Current charging status */
  isCharging: boolean;
  /** Battery net power in watts (for display) */
  batteryNetW: number;
};

// Assume a 5 kWh usable battery bank for runtime estimation.
const BANK_KWH = 5;
const TICK_MS = 2200;
const HOURS_PER_TICK = TICK_MS / 1000 / 3600; // ≈ 0.000611

/**
 * ──────────────────────────────────────────
 *  REALISTIC SOLAR SIMULATION
 * ──────────────────────────────────────────
 *
 * Solar follows the sun's position — peaks at solar noon,
 * goes to zero at night. We add a "cloud factor" that
 * smoothly drifts to simulate passing clouds.
 *
 * Load follows a realistic daily human pattern:
 *  · 00–06  → low (sleeping)
 *  · 06–09  → rising (morning routine)
 *  · 09–16  → moderate (daytime base load)
 *  · 16–20  → evening peak (lights, cooking, TV)
 *  · 20–24  → decreasing (winding down)
 */

/** Returns solar irradiance factor [0–1] for a given hour. */
function solarIrradiance(hour: number): number {
  // Cosine curve peaking at solar noon (12:30) — more realistic than raw sin
  const angle = ((hour - 6.5) / 12) * Math.PI;
  return clamp(Math.cos(angle), 0, 1);
}

/** Returns a load multiplier [0.4–1.5] for a given hour. */
function loadPattern(hour: number): number {
  if (hour < 6) return 0.4 + hour * 0.03; // 00–06: deep sleep → 0.4→0.58
  if (hour < 9) return 0.58 + (hour - 6) * 0.25; // 06–09: morning rush → 0.58→1.33
  if (hour < 16) return 1.0 + Math.sin(((hour - 9) / 7) * Math.PI) * 0.2; // 09–16: workday dip → ~1.0
  if (hour < 21) return 1.2 + (hour - 16) * 0.08; // 16–21: evening peak → 1.2→1.6
  return 1.6 - (hour - 21) * 0.15; // 21–24: winding down → 1.6→1.15
}

/** How many kWh our solar would generate at peak in clear sky (system size). */
const SYSTEM_PEAK_KW = 5.8;

function seedSeries(now: Date): SeriesPoint[] {
  const r = mulberry32(20350622);
  const startHour = now.getHours() - 11;
  const out: SeriesPoint[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = (((startHour + i) % 24) + 24) % 24;
    const irrad = solarIrradiance(hour);
    out.push({
      t: hour,
      solar: +(irrad * (SYSTEM_PEAK_KW - 0.8 + r() * 0.6)).toFixed(2),
      load: +(loadPattern(hour) * 1.3 + r() * 0.2).toFixed(2),
      battery: +(55 + irrad * 35 + r() * 3).toFixed(1),
    });
  }
  return out;
}

/**
 * Smooth cloud layer: a low-frequency noise that transitions
 * between clear (1.0), partly cloudy (~0.5), and overcast (~0.2).
 * We track it as a hidden state that drifts slowly.
 */
type CloudState = {
  factor: number;
  target: number;
  drift: number;
};

function updateCloudFactor(c: CloudState): number {
  // Slowly move toward target
  const f = c.factor + (c.target - c.factor) * 0.008 + Math.sin(c.drift) * 0.002;
  c.factor = clamp(f, 0.15, 1.0);
  c.drift += 0.003 + Math.random() * 0.005;

  // Every ~40 ticks, pick a new target
  if (Math.random() < 0.025) {
    if (Math.random() < 0.4) {
      c.target = 0.85 + Math.random() * 0.15; // clear
    } else if (Math.random() < 0.6) {
      c.target = 0.4 + Math.random() * 0.3; // partly cloudy
    } else {
      c.target = 0.15 + Math.random() * 0.25; // overcast
    }
  }
  return c.factor;
}

/**
 * Noise that affects load — appliances turning on/off
 * Gives the load a bit of realistic "twitch"
 */
function loadNoise(): number {
  // Occasionally a large-ish spike (fridge compressor, microwave, etc.)
  if (Math.random() < 0.04) return 0.3 + Math.random() * 0.6;
  return (Math.random() - 0.5) * 0.06;
}

export function useLiveMetrics(): Metrics {
  const cloudRef = useRef<CloudState>({ factor: 0.85, target: 0.9, drift: 0 });

  const [state, setState] = useState<Metrics>(() => {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    const irrad = solarIrradiance(hour);
    const solar = +(irrad * SYSTEM_PEAK_KW * 0.85).toFixed(2);
    const load = +(loadPattern(hour) * 1.3).toFixed(2);
    const net = solar - load;
    const batteryPct = 78;
    return {
      solarKw: solar,
      batteryPct,
      loadKw: load,
      batteryFlowKw: +net.toFixed(2),
      runtimeHours:
        load > 0 ? +((BANK_KWH * (batteryPct / 100)) / Math.max(-net, 0.05)).toFixed(1) : 99,
      series: seedSeries(now),
      todayKwh: +(solarIrradiance(Math.max(6, Math.min(hour, 18))) * 14).toFixed(1),
      peakKw: solar,
      isCharging: net >= 0,
      batteryNetW: Math.abs(Math.round(net * 1000)),
    };
  });

  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => {
        const now = new Date();
        const hour = now.getHours() + now.getMinutes() / 60;

        // ── Solar: irradiance × cloud factor ± small inverter noise ──
        const rawIrrad = solarIrradiance(hour);
        const cloudFactor = updateCloudFactor(cloudRef.current);
        const solarNoise = (Math.random() - 0.5) * 0.12; // inverter & sensor noise
        const solarKw = +clamp(
          rawIrrad * SYSTEM_PEAK_KW * cloudFactor + solarNoise,
          0,
          SYSTEM_PEAK_KW * 1.02,
        ).toFixed(2);

        // ── Load: pattern-based + noise ──
        const loadKw = +clamp(loadPattern(hour) * 1.3 + loadNoise(), 0.3, 2.8).toFixed(2);

        // ── Energy balance ──
        const net = solarKw - loadKw;
        const batteryFlowKw = +net.toFixed(2);
        const isCharging = batteryFlowKw >= 0;
        const batteryNetW = Math.abs(Math.round(batteryFlowKw * 1000));

        // ── Battery SOC: integrate net power over time ──
        // Each tick represents ~0.1% of a day's energy
        const socDrift = (net / BANK_KWH) * HOURS_PER_TICK * 100;
        const batteryPct = +clamp(s.batteryPct + socDrift, 10, 100).toFixed(1);

        // ── Runtime: when discharging, how long until 10% SOC ──
        const effectiveCapacity = BANK_KWH * ((batteryPct - 10) / 100);
        const dischargeRate = Math.max(-batteryFlowKw, 0); // only when discharging
        const runtimeHours =
          dischargeRate > 0.05 ? +clamp(effectiveCapacity / dischargeRate, 0, 48).toFixed(1) : 48;

        // ── Accumulated energy today ──
        const todayKwh = +(s.todayKwh + solarKw * HOURS_PER_TICK).toFixed(1);

        // ── Peak tracking ──
        // Reset peak at midnight-ish
        const peakKw = hour < 1 && s.peakKw > 0.5 ? 0 : Math.max(s.peakKw, solarKw);

        // ── Series ──
        const last = s.series[s.series.length - 1];
        const prevT = last.t;
        // Advance time in the series; handle wrapping past midnight
        const newT = (prevT + 0.5) % 24; // 0.5 = ~30 min steps visually
        const series: SeriesPoint[] = [
          ...s.series.slice(1),
          { t: +newT.toFixed(1), solar: solarKw, load: loadKw, battery: batteryPct },
        ];

        return {
          solarKw,
          batteryPct,
          loadKw,
          batteryFlowKw,
          runtimeHours,
          series,
          todayKwh,
          peakKw,
          isCharging,
          batteryNetW,
        };
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  return state;
}
