/**
 * Tuya + Simulation Integration Layer
 * =====================================
 *
 * Bridges the Tuya IoT API (via server functions) and the Simulation
 * (useLiveMetrics from command-data).
 *
 * How it works:
 *   1. On mount, ask the server whether Tuya credentials are configured.
 *   2. If configured → poll the server function every 10s for live metrics.
 *   3. If the device is offline / the call fails → show simulation + offline.
 *   4. If not configured → use simulation only.
 *
 * All credential access happens server-side in `tuya-server.ts`. This hook
 * never reads environment variables or imports the client secret.
 *
 * Server-only environment variables:
 *   TUYA_CLIENT_ID
 *   TUYA_CLIENT_SECRET
 *   TUYA_DEVICE_ID
 *   TUYA_ENDPOINT
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { getTuyaMetrics } from "./tuya-server";
import { useLiveMetrics as useSimulatedMetrics, type Metrics } from "./command-data";

export type DataSource = "connecting" | "simulation" | "tuya" | "offline";

export type TuyaStatus = {
  source: DataSource;
  systemVoltage: number;
  mpptEfficiency: number;
  deviceId: string;
  lastSync: number;
};

const INITIAL_TUYA_STATUS: TuyaStatus = {
  source: "simulation",
  systemVoltage: 0,
  mpptEfficiency: 0,
  deviceId: "",
  lastSync: 0,
};

const CONNECTING_TUYA_STATUS: TuyaStatus = {
  ...INITIAL_TUYA_STATUS,
  source: "connecting",
};

/**
 * useLiveMetrics — auto-selects the data source
 *
 * - If server-side Tuya credentials exist → poll the API every 10s
 * - If Tuya is offline → show simulation + offline status
 * - If no credentials → use simulation only
 */
export function useLiveMetrics(): Metrics & { tuya?: TuyaStatus } {
  const sim = useSimulatedMetrics();
  // `hasTuya` is discovered from the server (not from client env vars).
  // null = unknown (still connecting), true = configured, false = not configured.
  const [hasTuya, setHasTuya] = useState<boolean | null>(null);
  const [tuyaMetrics, setTuyaMetrics] = useState<{
    solarKw: number;
    batteryPct: number;
    loadKw: number;
    batteryFlowKw: number;
    systemVoltage: number;
    mpptEfficiency: number;
    deviceId: string;
  } | null>(null);
  const [tuyaStatus, setTuyaStatus] = useState<TuyaStatus>(CONNECTING_TUYA_STATUS);
  const mounted = useRef(true);

  const poll = useCallback(async () => {
    try {
      const result = await getTuyaMetrics();
      if (!mounted.current) return;

      // Reconcile hasTuya with whatever the server reported.
      if (result.configured && hasTuya !== true) setHasTuya(true);
      if (!result.configured) {
        setHasTuya(false);
        setTuyaStatus(INITIAL_TUYA_STATUS);
        return;
      }

      if (result.metrics && result.metrics.online) {
        setTuyaMetrics({
          solarKw: result.metrics.solarKw,
          batteryPct: result.metrics.batteryPct,
          loadKw: result.metrics.loadKw,
          batteryFlowKw: result.metrics.batteryFlowKw,
          systemVoltage: result.metrics.systemVoltage,
          mpptEfficiency: result.metrics.mpptEfficiency,
          deviceId: result.deviceId,
        });
        setTuyaStatus({
          source: "tuya",
          systemVoltage: result.metrics.systemVoltage,
          mpptEfficiency: result.metrics.mpptEfficiency,
          deviceId: result.deviceId,
          lastSync: Date.now(),
        });
      } else {
        // Tuya configured but offline
        setTuyaStatus((prev) => ({
          ...prev,
          source: "offline",
          deviceId: result.deviceId,
          lastSync: Date.now(),
        }));
      }
    } catch {
      if (mounted.current) {
        setTuyaStatus((prev) => ({ ...prev, source: "offline", lastSync: Date.now() }));
      }
    }
  }, [hasTuya]);

  useEffect(() => {
    mounted.current = true;
    // Poll immediately, then every 10 seconds. The first call also resolves
    // `hasTuya`; until then the source stays "connecting".
    poll();
    const id = setInterval(poll, 10000);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [poll]);

  // Once we know Tuya is NOT configured, drop the connecting status.
  useEffect(() => {
    if (hasTuya === false) {
      setTuyaStatus(INITIAL_TUYA_STATUS);
    }
  }, [hasTuya]);

  const merged = useMemo(() => {
    if (!tuyaMetrics) {
      return { ...sim, tuya: tuyaStatus };
    }
    const isCharging = tuyaMetrics.batteryFlowKw >= 0;
    return {
      ...sim,
      ...tuyaMetrics,
      batteryFlowKw: tuyaMetrics.batteryFlowKw,
      isCharging,
      batteryNetW: Math.abs(Math.round(tuyaMetrics.batteryFlowKw * 1000)),
      tuya: tuyaStatus,
    };
  }, [sim, tuyaMetrics, tuyaStatus]);

  return merged;
}

export { type Metrics } from "./command-data";
