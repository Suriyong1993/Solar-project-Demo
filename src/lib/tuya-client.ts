/**
 * Tuya IoT Open API Client
 *
 * Client สำหรับเรียก Tuya Open API เพื่อดึงข้อมูลสถานะอุปกรณ์
 * และส่งคำสั่งควบคุม (switch on/off)
 *
 * อ้างอิง: https://developer.tuya.com/en/docs/iot
 *
 * ใช้งานร่วมกับ simulation hook (useLiveMetrics) โดย:
 *   - ถ้ามี Tuya config → ดึงข้อมูลจริง
 *   - ถ้าไม่มี → ใช้ simulation (fallback)
 *
 * NOTE: ทุกฟังก์ชัน crypto เป็น async (Web Crypto API)
 *       ทำงานได้ทั้ง browser และ Node.js
 */

import { getTuyaConfig } from "./tuya-config";
import { sha256, hmacSha256 } from "./tuya-crypto";

/* ============================================================
   TYPES
   ============================================================ */

export type TuyaTokenResponse = {
  success: boolean;
  result?: {
    access_token: string;
    expire_time: number;
    refresh_token: string;
    uid: string;
  };
  msg?: string;
  code?: number;
};

export type TuyaDeviceStatus = {
  code: string;
  value: boolean | number | string;
};

export type TuyaDeviceInfoResponse = {
  success: boolean;
  result?: {
    status: TuyaDeviceStatus[];
    active_time: number;
    biz_type: number;
    category: string;
    create_time: number;
    icon: string;
    id: string;
    ip: string;
    lat: string;
    lon: string;
    model: string;
    name: string;
    online: boolean;
    owner_id: string;
    product_id: string;
    product_name: string;
    sub: boolean;
    uuid: string;
  };
  msg?: string;
  code?: number;
};

export type TuyaPhaseData = {
  voltage: number;
  current: number;
  power: number;
} | null;

export type TuyaSolarMetrics = {
  solarKw: number;
  batteryPct: number;
  loadKw: number;
  batteryFlowKw: number;
  systemVoltage: number;
  mpptEfficiency: number;
  online: boolean;
};

/* ============================================================
   TOKEN MANAGEMENT
   ============================================================ */

let cachedToken: { token: string; expiresAt: number } | null = null;

async function fetchAccessToken(): Promise<string> {
  const config = getTuyaConfig();
  if (!config) throw new Error("[Tuya] No config available");

  const { clientId, clientSecret, endpoint } = config;
  const t = Date.now().toString();
  const method = "GET";
  const path = "/v1.0/token?grant_type=1";
  const bodyStr = "";

  const bodyHash = await sha256(bodyStr);
  const canonical = [method, bodyHash, "", path].join("\n");
  const signPayload = clientId + t + canonical;
  const sign = await hmacSha256(signPayload, clientSecret);

  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers: {
      client_id: clientId,
      sign,
      sign_method: "HMAC-SHA256",
      t,
    },
  });

  const data: TuyaTokenResponse = await response.json();

  if (!data.success || !data.result?.access_token) {
    throw new Error(`[Tuya] Token fetch failed: ${data.msg || "unknown"}`);
  }

  cachedToken = {
    token: data.result.access_token,
    expiresAt: Date.now() + (data.result.expire_time - 300) * 1000,
  };

  return data.result.access_token;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }
  return fetchAccessToken();
}

/* ============================================================
   SIGNATURE HELPER
   ============================================================ */

type RequestOptions = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
};

async function signedRequest<T>(options: RequestOptions): Promise<T> {
  const config = getTuyaConfig();
  if (!config) throw new Error("[Tuya] No config");

  const token = await getAccessToken();
  const { clientId, clientSecret, endpoint } = config;
  const { method, path, body } = options;

  const t = Date.now().toString();
  const bodyStr = body ? JSON.stringify(body) : "";
  const bodyHash = await sha256(bodyStr);
  const canonical = [method, bodyHash, "", path].join("\n");
  const signPayload = clientId + token + t + canonical;
  const sign = await hmacSha256(signPayload, clientSecret);

  const headers: Record<string, string> = {
    client_id: clientId,
    access_token: token,
    sign,
    sign_method: "HMAC-SHA256",
    t,
  };

  if (body) headers["Content-Type"] = "application/json";

  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return response.json();
}

/* ============================================================
   DEVICE API
   ============================================================ */

export async function getDeviceInfo(): Promise<TuyaDeviceInfoResponse> {
  const config = getTuyaConfig();
  if (!config) throw new Error("[Tuya] No config");
  return signedRequest<TuyaDeviceInfoResponse>({
    method: "GET",
    path: `/v1.0/iot-03/devices/${config.deviceId}`,
  });
}

export async function sendCommand(
  commands: { code: string; value: boolean | number | string }[],
): Promise<{ success: boolean; msg?: string }> {
  const config = getTuyaConfig();
  if (!config) throw new Error("[Tuya] No config");
  return signedRequest({
    method: "POST",
    path: `/v1.0/iot-03/devices/${config.deviceId}/commands`,
    body: { commands },
  });
}

/* ============================================================
   BASE64 TELEMETRY DECODER (isomorphic — no Buffer)
   ============================================================ */

/**
 * ถอดรหัส base64 telemetry จาก Tuya
 * ใช้ atob + Uint8Array + DataView ทำงานได้ทั้ง browser และ Node.js
 * ไม่พึ่งพา Buffer (Node-only)
 */
export function decodeBase64Telemetry(base64Str: string | unknown): TuyaPhaseData {
  if (typeof base64Str !== "string") return null;

  try {
    const binary = atob(base64Str);
    if (binary.length < 6) return null;

    const buf = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buf[i] = binary.charCodeAt(i);
    }

    const dv = new DataView(buf.buffer);
    const voltage = dv.getUint16(0) / 10;
    const current = dv.getUint16(2) / 100;
    const power = dv.getUint16(4);
    return { voltage, current, power };
  } catch {
    return null;
  }
}

/* ============================================================
   BATTERY SOC ESTIMATION
   ============================================================ */

export function estimateSocFromVoltage(voltage: number): number {
  if (voltage <= 0) return 0;

  if (voltage <= 15.0) {
    return Math.round(((voltage - 11.0) / (13.5 - 11.0)) * 100);
  }
  if (voltage <= 30.0) {
    return Math.round(((voltage - 22.0) / (27.0 - 22.0)) * 100);
  }
  return Math.round(((voltage - 44.0) / (54.0 - 44.0)) * 100);
}

/* ============================================================
   PARSE SOLAR METRICS
   ============================================================ */

export function parseSolarMetricsFromStatus(statuses: TuyaDeviceStatus[]): TuyaSolarMetrics | null {
  const statusMap = new Map(statuses.map((s) => [s.code, s.value]));

  const directPct = statusMap.get("battery_percentage");
  const batteryPct = typeof directPct === "number" ? directPct : 50;

  const phaseA = decodeBase64Telemetry(statusMap.get("phase_a"));
  const phaseB = decodeBase64Telemetry(statusMap.get("phase_b"));
  const phaseC = decodeBase64Telemetry(statusMap.get("phase_c"));

  const solarKw = phaseA ? +(phaseA.power / 1000).toFixed(2) : 0;
  const loadKw = phaseC ? +(phaseC.power / 1000).toFixed(2) : 0;

  let batteryPctFinal = batteryPct;
  let systemVoltage = 0;

  if (phaseB) {
    systemVoltage = phaseB.voltage;
    if (typeof directPct !== "number") {
      batteryPctFinal = estimateSocFromVoltage(phaseB.voltage);
    }
  }

  const netKw = +(solarKw - loadKw).toFixed(2);

  const mpptEfficiency =
    phaseA && phaseA.power > 0 && phaseA.voltage > 0 && phaseA.current > 0
      ? +((phaseA.power / (phaseA.voltage * phaseA.current)) * 100).toFixed(1)
      : 0;

  return {
    solarKw,
    batteryPct: Math.max(0, Math.min(100, batteryPctFinal)),
    loadKw,
    batteryFlowKw: netKw,
    systemVoltage,
    mpptEfficiency,
    online: true,
  };
}

/* ============================================================
   HIGH-LEVEL: PULL METRICS FROM TUYA
   ============================================================ */

export async function pullTuyaMetrics(): Promise<TuyaSolarMetrics | null> {
  const config = getTuyaConfig();
  if (!config) {
    console.log("[Tuya] No config, returning null");
    return null;
  }

  try {
    const info = await getDeviceInfo();
    if (!info.success || !info.result) {
      console.warn("[Tuya] Device info failed:", info.msg);
      return null;
    }

    if (!info.result.online) {
      console.warn("[Tuya] Device offline");
      return {
        solarKw: 0,
        batteryPct: 0,
        loadKw: 0,
        batteryFlowKw: 0,
        systemVoltage: 0,
        mpptEfficiency: 0,
        online: false,
      };
    }

    const metrics = parseSolarMetricsFromStatus(info.result.status);
    if (metrics) {
      metrics.online = info.result.online;
    }
    return metrics;
  } catch (err) {
    console.error("[Tuya] Pull error:", err);
    return null;
  }
}
