# Sprint 0 — Make the Dashboard Trustworthy

> **Goal:** The dashboard must become trustworthy.
> **Definition of Done:**
> - No client secrets.
> - Navigation works.
> - System status reflects reality.
> - Metrics are based on real telemetry.

## Scope

Only the four confirmed P0 issues from UI_AUDIT.md (2026-06-28).
No P1, no P2, no new features, no redesign.

## Task Queue

Exactly one active task at a time. Sequential execution.

### S0-T1 — P0-1: Move Tuya credentials server-side
- **Status:** COMPLETE (commit 0841fb7)
- **Severity:** P0 Security
- **Problem:** `tuya-config.ts` reads `VITE_TUYA_CLIENT_SECRET` (Vite prefix = client bundle). `SettingsPanel.tsx` also reads it. The Tuya client secret is exposed to the browser.
- **Files affected:**
  - `src/lib/tuya-config.ts` (reads VITE_ prefixed env)
  - `src/lib/tuya-client.ts` (imports tuya-config, runs in client)
  - `src/lib/tuya-integration.tsx` (imports tuya-client into React hook)
  - `src/components/command/SettingsPanel.tsx` (reads VITE_ env directly)
- **Fix:** Move all Tuya API calls to TanStack Start server functions (`createServerFn`). Client hook fetches from the server function endpoint. Remove all `VITE_TUYA_*` references. SettingsPanel shows only boolean config status (set/not-set), never the secret value.
- **Verification:** `grep -r "VITE_TUYA" src/` returns zero matches. `npx tsc --noEmit` passes. App runs in dev.

### S0-T2 — P0-3: Drive system status from real state
- **Status:** ACTIVE
- **Severity:** P0 Honesty
- **Problem:** `index.tsx:148-159` renders "Systems Nominal" badge unconditionally green, regardless of `tuya.source`.
- **Fix:** Drive the badge from `m.tuya.source`. offline → red "OFFLINE", connecting → amber "CONNECTING", simulation → muted "SIMULATED", tuya → green "SYSTEMS NOMINAL".
- **Verification:** Badge changes color/text when source changes. `npx tsc --noEmit` passes.

### S0-T3 — P0-4: Remove or label fabricated metrics
- **Status:** PENDING
- **Severity:** P0 Honesty
- **Problem:** Multiple fake values presented as real:
  - `TopNav.tsx:13` — random latency `Math.random()*12+4`
  - `EnergyFlowNetwork.tsx:37` — hardcoded "98.2%" MPPT
  - `index.tsx:96-103` — fake "Efficiency" = `solarKw/5.8*100`, always "OPTIMAL"
  - `AIInsights.tsx:77` — hardcoded 18.5 kWh "30-day avg"
  - `index.tsx:125 vs 377` — savings computed two different ways ($0.12 vs $0.15)
  - `index.tsx:373` — "Energy Consumed" = `loadKw * 12` (fabricated)
  - `index.tsx:397` — "3 trees" claim (arbitrary)
- **Fix:** Remove fake values or clearly label them as simulated/derived. Use one consistent savings formula. Remove random latency (or compute from real poll time). Remove hardcoded MPPT (or drive from real data when available).
- **Verification:** No `Math.random` in metric paths. No hardcoded "98.2%". One savings formula. `npx tsc --noEmit` passes.

### S0-T4 — P0-2: Wire FloatingNav tabs to real panels
- **Status:** PENDING
- **Severity:** P0 Navigation
- **Problem:** `FloatingNav` calls `onTabChange(id)` which sets `activeTab` state, but nothing renders based on it. `AlertsPanel` and `SettingsPanel` are defined but never imported in `index.tsx`.
- **Fix:** Import `AlertsPanel` and `SettingsPanel` in `index.tsx`. Render them as overlays when `activeTab === "alerts"` or `activeTab === "settings"`. Wire "energy"/"analytics" tabs to scroll to relevant sections or remove them if no destination exists. Pass `tuya` status data to both panels.
- **Verification:** Clicking Alerts tab opens AlertsPanel. Clicking Settings tab opens SettingsPanel. Both close properly. `npx tsc --noEmit` passes.

## Sprint Completion Criteria

- [ ] S0-T1 complete and committed
- [ ] S0-T2 complete and committed
- [ ] S0-T3 complete and committed
- [ ] S0-T4 complete and committed
- [ ] `npx tsc --noEmit` passes
- [ ] `bun run build` passes
- [ ] App runs in dev mode without errors
- [ ] No `VITE_TUYA` references in source
- [ ] No `Math.random` in metric display paths
