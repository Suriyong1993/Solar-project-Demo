/**
 * Derived Metrics — single module for all derived/computed values
 * ================================================================
 *
 * Every derived value (savings, CO₂, efficiency, uptime) lives here.
 * Components import from this module; they never compute inline.
 *
 * This prevents:
 * - savings formula diverging (was $0.12 in one place, $0.15 in another)
 * - fake hardcoded values returning (18.5 kWh avg, "3 trees", etc.)
 * - MPPT showing hardcoded "98.2%" when real data is available
 *
 * Constants:
 *   SAVINGS_RATE_USD   — electricity rate per kWh (Thailand: $0.12)
 *   CO2_FACTOR_KG      — kg CO₂ avoided per kWh solar generated
 *   SYSTEM_PEAK_KW     — rated peak solar system size for efficiency calc
 */

import type { Metrics } from "./command-data";
import type { DataSource } from "./tuya-integration";

/** Thailand residential electricity rate (~$0.12/kWh). */
export const SAVINGS_RATE_USD = 0.12;

/** CO₂ emission factor: 0.7 kg CO₂ avoided per kWh of solar generation. */
export const CO2_FACTOR_KG = 0.7;

/** Rated peak solar system size in kW. Used for efficiency calculation. */
export const SYSTEM_PEAK_KW = 5.8;

export type DerivedMetrics = {
  /** Financial savings in USD, based on today's kWh × rate. */
  savingsUsd: number;
  /** CO₂ avoided in kg, based on today's kWh × factor. */
  co2SavedKg: number;
  /** Solar efficiency as percentage (solarKw / systemPeakKw × 100). */
  efficiencyPct: number;
  /** MPPT efficiency from Tuya when live, null in simulation mode. */
  mpptEfficiencyPct: number | null;
  /** System uptime formatted: { value, unit }. */
  uptime: { value: number; unit: string };
};

/**
 * Derive all computed metrics from raw metrics + data source.
 *
 * @param raw              - Raw metrics from useLiveMetrics (sim or Tuya)
 * @param source           - Current data source (controls MPPT visibility)
 * @param tuyaMpptEfficiency - MPPT efficiency from Tuya status (0 if not live)
 * @returns DerivedMetrics — all derived values, ready for display
 */
export function deriveMetrics(
  raw: Metrics,
  source: DataSource,
  tuyaMpptEfficiency?: number,
): DerivedMetrics {
  const savingsUsd = +(raw.todayKwh * SAVINGS_RATE_USD).toFixed(2);
  const co2SavedKg = Math.round(raw.todayKwh * CO2_FACTOR_KG);
  const efficiencyPct = +(
    raw.solarKw > 0
      ? (raw.solarKw / SYSTEM_PEAK_KW) * 100
      : 0
  ).toFixed(0);

  // MPPT efficiency is only meaningful from real Tuya data.
  // In simulation mode, we don't fabricate it.
  const mpptEfficiencyPct =
    source === "tuya" && tuyaMpptEfficiency != null && tuyaMpptEfficiency > 0
      ? tuyaMpptEfficiency
      : null;

  const uptime = formatUptime(raw.runtimeHours);

  return { savingsUsd, co2SavedKg, efficiencyPct, mpptEfficiencyPct, uptime };
}

/**
 * Format runtime hours into a human-readable { value, unit } pair.
 * Under 24h → hours; over 24h → days.
 */
function formatUptime(runtimeHours: number): { value: number; unit: string } {
  if (runtimeHours > 24) {
    return {
      value: +(runtimeHours / 24).toFixed(1),
      unit: "days",
    };
  }
  return {
    value: +runtimeHours.toFixed(1),
    unit: "hrs",
  };
}