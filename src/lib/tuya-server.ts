/**
 * Tuya IoT — Server-side API client
 * ==================================
 *
 * ALL Tuya API calls happen here, server-side only.
 * The client secret is NEVER exposed to the browser bundle.
 *
 * Environment variables (server-only, NO VITE_ prefix):
 *   TUYA_CLIENT_ID
 *   TUYA_CLIENT_SECRET
 *   TUYA_DEVICE_ID
 *   TUYA_ENDPOINT  (optional, defaults to https://openapi.tuyaus.com)
 */

import { createServerFn } from "@tanstack/react-start";
import { createHmac, createHash } from "node:crypto";

/* ============================================================
   TYPES
   ============================================================ */

export type TuyaSolarMetrics = {
  solarKw: number;
  batteryPct: number;
  loadKw: number;
  batteryFlowKw: number;
  systemVoltage: number;
  mpptEfficiency: number;
  online: boolean;
};

export type TuyaConfig = {
  clientId: string;
  clientSecret: string;
  deviceId: string;
  endpoint: string;
};

export type TuyaConfigStatus = {
  clientId: boolean;
  clientSecret: boolean;
  deviceId: boolean;
  endpoint: string;
};

export type TuyaMetricsResponse = {
  metrics: TuyaSolarMetrics | null;
  deviceId: string;
  configured: boolean;
};

/* ============================================================
   CONFIG — server-only env reads
   ============================================================ */

function getEnv(name: string): string | undefined {
  if (typeof process !== "undefined" && process.env) {
    return process.env[name];
  }
  return undefined;
}

function getConfig() {
  const clientId = getEnv("TUYA_CLIENT_ID");
  const clientSecret = getEnv("TUYA_CLIENT_SECRET");
  const deviceId = getEnv("TUYA_DEVICE_ID");
  const endpoint = getEnv("TUYA_ENDPOINT") || "https://openapi.tuyaus.com";
  return { clientId, clientSecret, deviceId, endpoint };
}

/* ============================================================
   TOKEN MANAGEMENT
   ============================================================ */

let cachedToken: { token: string; expiresAt: number } | null = null;

async function fetchAccessToken(
  clientId: string,
  clientSecret: string,
  endpoint: string,
): Promise<string> {
  const t = Date.now().toString();
  const method = "GET";
  const path = "/v1.0/token?grant_type=1";
  const bodyStr = "";

  const bodyHash = sha256Hex(bodyStr);
  const canonical = [method, bodyHash, "", path].join("\n");
  const signPayload = clientId + t + canonical;
  const sign = hmacSha256(signPayload, clientSecret);

  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers: {
      client_id: clientId,
      sign,
      sign_method: "HMAC-SHA256",
      t,
    },
  });

  const data = (await response.json()) as {
    success: boolean;
    result?: { access_token: string; expire_time: number };
    msg?: string;
  };

  if (!data.success || !data.result?.access_token) {
    throw new Error(`[Tuya] Token fetch failed: ${data.msg || "unknown"}`);
  }

  cachedToken = {
    token: data.result.access_token,
    expiresAt: Date.now() + (data.result.expire_time - 300) * 1000,
  };

  return data.result.access_token;
}

async function getAccessToken(
  clientId: string,
  clientSecret: string,
  endpoint: string,
): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }
  return fetchAccessToken(clientId, clientSecret, endpoint);
}

/* ============================================================
   SIGNATURE HELPERS — Node.js crypto (server-only)
   ============================================================ */

function sha256Hex(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

function hmacSha256(message: string, secret: string): string {
  return createHmac("sha256", secret).update(message).digest("hex").toUpperCase();
}

/* ============================================================
   SIGNED REQUEST
   ============================================================ */

type RequestOptions = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  token?: string;
};

async function signedRequest<T>(
  options: RequestOptions,
  clientId: string,
  clientSecret: string,
  endpoint: string,
): Promise<T> {
  const token = options.token
    ? options.token
    : await getAccessToken(clientId, clientSecret, endpoint);
  const { method, path, body } = options;

  const t = Date.now().toString();
  const bodyStr = body ? JSON.stringify(body) : "";
  const bodyHash = sha256Hex(bodyStr);
  const canonical = [method, bodyHash, "", path].join("\n");
  const signPayload = clientId + token + t + canonical;
  const sign = hmacSha256(signPayload, clientSecret);

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

  return response.json() as Promise<T>;
}

/* ============================================================
   DEVICE API
   ============================================================ */

type TuyaDeviceStatus = {
  code: string;
  value: boolean | number | string;
};

type TuyaDeviceInfoResponse = {
  success: boolean;
  result?: {
    status: TuyaDeviceStatus[];
    online: boolean;
  };
  msg?: string;
};

async function getDeviceInfo(
  deviceId: string,
  clientId: string,
  clientSecret: string,
  endpoint: string,
): Promise<TuyaDeviceInfoResponse> {
  return signedRequest<TuyaDeviceInfoResponse>(
    { method: "GET", path: `/v1.0/iot-03/devices/${deviceId}` },
    clientId,
    clientSecret,
    endpoint,
  );
}

/* ============================================================
   BASE64 TELEMETRY DECODER
   ============================================================ */

type TuyaPhaseData = {
  voltage: number;
  current: number;
  power: number;
} | null;

function decodeBase64Telemetry(base64Str: string | unknown): TuyaPhaseData {
  if (typeof base64Str !== "string") return null;

  try {
    const binary = Buffer.from(base64Str, "base64");
    if (binary.length < 6) return null;

    const voltage = binary.readUInt16BE(0) / 10;
    const current = binary.readUInt16BE(2) / 100;
    const power = binary.readUInt16BE(4);
    return { voltage, current, power };
  } catch {
    return null;
  }
}

/* ============================================================
   BATTERY SOC ESTIMATION
   ============================================================ */

function estimateSocFromVoltage(voltage: number): number {
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

function parseSolarMetricsFromStatus(statuses: TuyaDeviceStatus[]): TuyaSolarMetrics | null {
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
   SERVER FUNCTIONS
   ============================================================ */

/**
 * Fetch live solar metrics from Tuya IoT.
 * Returns null if credentials are missing or the API call fails.
 */
export const getTuyaMetrics = createServerFn({ method: "GET" }).handler(async () => {
  const { clientId, clientSecret, deviceId, endpoint } = getConfig();

  if (!clientId || !clientSecret || !deviceId) {
    return { metrics: null, deviceId: "", configured: false } as TuyaMetricsResponse;
  }

  try {
    const info = await getDeviceInfo(deviceId, clientId, clientSecret, endpoint);

    if (!info.success || !info.result) {
      return { metrics: null, deviceId, configured: true } as TuyaMetricsResponse;
    }

    if (!info.result.online) {
      return {
        metrics: {
          solarKw: 0,
          batteryPct: 0,
          loadKw: 0,
          batteryFlowKw: 0,
          systemVoltage: 0,
          mpptEfficiency: 0,
          online: false,
        },
        deviceId,
        configured: true,
      } as TuyaMetricsResponse;
    }

    const metrics = parseSolarMetricsFromStatus(info.result.status);
    if (metrics) {
      metrics.online = info.result.online;
    }

    return { metrics, deviceId, configured: true } as TuyaMetricsResponse;
  } catch (err) {
    console.error("[Tuya] Pull error:", err);
    return { metrics: null, deviceId, configured: true } as TuyaMetricsResponse;
  }
});

/**
 * Get configuration status — booleans only, NEVER the actual secret value.
 */
export const getTuyaConfigStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { clientId, clientSecret, deviceId, endpoint } = getConfig();

  return {
    clientId: !!clientId,
    clientSecret: !!clientSecret,
    deviceId: !!deviceId,
    endpoint,
  } as TuyaConfigStatus;
});
