/**
 * Tuya IoT Configuration — shared types only
 *
 * Credentials are read server-side in `tuya-server.ts` from `process.env`
 * (NO `VITE_` prefix), so the client secret is never bundled into client JS.
 *
 * Server-only environment variables:
 *   TUYA_CLIENT_ID
 *   TUYA_CLIENT_SECRET
 *   TUYA_DEVICE_ID
 *   TUYA_ENDPOINT          (optional, defaults to https://openapi.tuyaus.com)
 *
 * Tuya Open API Regions:
 *   - Americas: https://openapi.tuyaus.com
 *   - Europe:   https://openapi.tuyaeu.com
 *   - China:    https://openapi.tuyacn.com
 *   - India:    https://openapi.tuyain.com
 */

// Re-export the interface so existing type-only imports keep working without
// pulling the server module (and its createServerFn side effects) into the
// client bundle.
export type { TuyaConfig } from "./tuya-server";
