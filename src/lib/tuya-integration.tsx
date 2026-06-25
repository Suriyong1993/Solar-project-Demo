/**
 * Tuya + Simulation Integration Layer
 * =====================================
 * 
 * ตัวเชื่อมระหว่าง Tuya IoT API และ Simulation (useLiveMetrics)
 * 
 * การทำงาน:
 *   1. ถ้ามี Environment Variables (TUYA_CLIENT_ID ฯลฯ) → เรียก Tuya API จริง
 *   2. ถ้าไม่มี → ใช้ Simulation (fallback)
 * 
 * วิธีตั้งค่า:
 *   สร้างไฟล์ `.env` ในโฟลเดอร์ radiant-command-core:
 *   
 *     VITE_TUYA_CLIENT_ID=your_access_id
 *     VITE_TUYA_CLIENT_SECRET=your_access_secret
 *     VITE_TUYA_DEVICE_ID=your_device_id
 *     VITE_TUYA_ENDPOINT=https://openapi.tuyaus.com
 *   
 *   หรือใช้ server-side environment variables:
 *   
 *     TUYA_CLIENT_ID=your_access_id
 *     TUYA_CLIENT_SECRET=your_access_secret
 *     TUYA_DEVICE_ID=your_device_id
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getTuyaConfig } from "./tuya-config";
import { pullTuyaMetrics } from "./tuya-client";
import { useLiveMetrics as useSimulatedMetrics, type Metrics } from "./command-data";

export type DataSource = "connecting" | "simulation" | "tuya" | "offline";

export type TuyaStatus = {
  source: DataSource;
  systemVoltage: number;
  mpptEfficiency: number;
  deviceId: string;
  lastSync: number;
};

/**
 * useLiveMetrics — เลือก data source อัตโนมัติ
 * 
 * - ถ้ามี Tuya credentials → Poll API จริงทุกๆ 10 วินาที
 * - ถ้า Tuya offline → แสดง simulation + offline status
 * - ถ้าไม่มี credentials → ใช้ simulation อย่างเดียว
 */
export function useLiveMetrics(): Metrics & { tuya?: TuyaStatus } {
  const sim = useSimulatedMetrics();
  const [tuyaMetrics, setTuyaMetrics] = useState<{
    solarKw: number;
    batteryPct: number;
    loadKw: number;
    batteryFlowKw: number;
  } | null>(null);
  const hasTuya = !!getTuyaConfig();
  const [tuyaStatus, setTuyaStatus] = useState<TuyaStatus>({
    source: hasTuya ? "connecting" : "simulation",
    systemVoltage: 0,
    mpptEfficiency: 0,
    deviceId: "",
    lastSync: 0,
  });
  const mounted = useRef(true);

  const poll = useCallback(async () => {
    if (!hasTuya) return;

    try {
      const result = await pullTuyaMetrics();
      if (!mounted.current) return;

      if (result && result.online) {
        setTuyaMetrics({
          solarKw: result.solarKw,
          batteryPct: result.batteryPct,
          loadKw: result.loadKw,
          batteryFlowKw: result.batteryFlowKw,
        });
        setTuyaStatus({
          source: "tuya",
          systemVoltage: result.systemVoltage,
          mpptEfficiency: result.mpptEfficiency,
          deviceId: getTuyaConfig()?.deviceId || "",
          lastSync: Date.now(),
        });
      } else {
        // Tuya configured but offline
        setTuyaStatus((prev) => ({
          ...prev,
          source: "offline",
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
    if (hasTuya) {
      // Poll immediately, then every 10 seconds
      poll();
      const id = setInterval(poll, 10000);
      return () => {
        mounted.current = false;
        clearInterval(id);
      };
    }
    return () => {
      mounted.current = false;
    };
  }, [hasTuya, poll]);

  if (tuyaMetrics) {
    return {
      ...sim,
      ...tuyaMetrics,
      batteryFlowKw: tuyaMetrics.batteryFlowKw,
      isCharging: tuyaMetrics.batteryFlowKw >= 0,
      batteryNetW: Math.abs(Math.round(tuyaMetrics.batteryFlowKw * 1000)),
      tuya: tuyaStatus,
    };
  }

  return { ...sim, tuya: tuyaStatus };
}

export { type Metrics } from "./command-data";