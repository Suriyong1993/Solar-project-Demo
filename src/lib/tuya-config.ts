/**
 * ทูยา IoT Configuration — ใช้ Environment Variables
 *
 * วิธีตั้งค่า: สร้างไฟล์ `.env` ใน root project แล้วใส่ค่าต่อไปนี้:
 *
 *   TUYA_CLIENT_ID=your_access_id
 *   TUYA_CLIENT_SECRET=your_access_secret
 *   TUYA_DEVICE_ID=your_device_id
 *   TUYA_ENDPOINT=https://openapi.tuyaus.com  (หรือ tuyaeu, tuyacn ตามภูมิภาค)
 *
 * Tuya Open API Regions:
 *   - อเมริกา:  https://openapi.tuyaus.com
 *   - ยุโรป:    https://openapi.tuyaeu.com
 *   - จีน:      https://openapi.tuyacn.com
 *   - อินเดีย:  https://openapi.tuyain.com
 */

export interface TuyaConfig {
  clientId: string;
  clientSecret: string;
  deviceId: string;
  endpoint: string;
}

export function getTuyaConfig(): TuyaConfig | null {
  // รองรับทั้ง import.meta.env (Vite) และ process.env (Node)
  const env =
    typeof import.meta !== "undefined"
      ? (import.meta as unknown as { env: Record<string, string | undefined> }).env
      : process.env;
  if (!env) return null;

  const clientId = env.VITE_TUYA_CLIENT_ID || env.TUYA_CLIENT_ID;
  const clientSecret = env.VITE_TUYA_CLIENT_SECRET || env.TUYA_CLIENT_SECRET;
  const deviceId = env.VITE_TUYA_DEVICE_ID || env.TUYA_DEVICE_ID;
  const endpoint = env.VITE_TUYA_ENDPOINT || env.TUYA_ENDPOINT || "https://openapi.tuyaus.com";

  if (!clientId || !clientSecret || !deviceId) {
    console.warn(
      "[Tuya] Missing config. Set VITE_TUYA_CLIENT_ID, VITE_TUYA_CLIENT_SECRET, VITE_TUYA_DEVICE_ID",
    );
    return null;
  }

  return { clientId, clientSecret, deviceId, endpoint };
}
