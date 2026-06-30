# Claude Implementation Prompt — Solar-X v1.0 Sprint 0 (S0-T3) + UI Redesign

## Context

Project: `radiant-command-core` — TanStack Start (React 19 + Vite 8 + Nitro), Bun, TypeScript, Tailwind CSS v4, shadcn/ui.
Deploy: Vercel via Nitro preset. Package manager: **Bun**.
Working directory: project root (`radiant-command-core/`).

**Stack rules (from AGENTS.md):**
- `bun run dev` — dev server
- `bun run build` — production build (Nitro → Vercel preset)
- `bun run lint` — ESLint (also runs Prettier via plugin)
- No typecheck script — run `npx tsc --noEmit` manually
- Path alias: `@/*` → `./src/*`
- Server-only code: name files `*.server.ts`. Do NOT import `server-only` package.
- `routeTree.gen.ts` is auto-generated — never edit it.
- shadcn/ui components live in `src/components/ui/` — add via `npx shadcn@latest add <component>`.

**Do NOT touch:** `tuya-server.ts`, `tuya-integration.tsx`, `tuya-config.ts` (already fixed in S0-T1). Do NOT touch `EnergyGraph.tsx` (has pre-existing TS errors, not in scope).

---

## Part 1: Code Architecture — deriveMetrics module (S0-T3)

### Decisions (already made — do not ask the user)
- Savings rate: **$0.12/kWh** (Thailand residential)
- Remove ALL fake/fabricated values entirely (not labeled — removed)
- MPPT: use real Tuya value when live; in simulation mode, show "—" (em dash)

### Step 1: Create `src/lib/derived-metrics.ts`

```typescript
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
```

### Step 2: Update `src/routes/index.tsx`

**Imports — add after existing imports:**
```typescript
import { useLiveMetrics, type DataSource } from "@/lib/tuya-integration";
import { deriveMetrics } from "@/lib/derived-metrics";
```

**In the `Index` component, after `const currentHour = new Date().getHours();` add:**
```typescript
  const d = useMemo(
    () => deriveMetrics(m, m.tuya?.source ?? "simulation", m.tuya?.mpptEfficiency),
    [m],
  );
```

**In kpiCards useMemo array — change these cards:**
- `id: "efficiency"`: `value: \`${d.efficiencyPct}\`` (was inline `solarKw/5.8*100`)
- `id: "savings"` (CO₂ Saved): `value: d.co2SavedKg.toFixed(1)` (was inline `todayKwh*0.7`)
- `id: "carbon"` (Saved USD): `value: \`$${d.savingsUsd.toFixed(2)}\`` (was inline `todayKwh*0.12`)
- Add `d` to the useMemo dependency array: `[m, d]`

**EnergyFlowNetwork usage — add `mpptEfficiencyPct` prop:**
```tsx
<EnergyFlowNetwork
  solarKw={m.solarKw}
  batteryPct={m.batteryPct}
  loadKw={m.loadKw}
  batteryFlowKw={m.batteryFlowKw}
  isCharging={m.isCharging}
  mpptEfficiencyPct={d.mpptEfficiencyPct}
/>
```

**System Impact section — make these changes:**
1. **DELETE** the entire "Energy Consumed" div (the one with `(m.loadKw * 12).toFixed(1)`)
2. **"Financial Savings"**: change to `${d.savingsUsd.toFixed(2)}`
3. **"System Uptime"**: change to `{d.uptime.value}` and `{d.uptime.unit}`
4. **"Carbon Avoided" section**: DELETE the `<span>` that says "Equivalent to planting 3 trees"
5. **"Carbon Avoided" value**: change `Math.round(m.todayKwh * 0.7)` to `{d.co2SavedKg}`

### Step 3: Update `src/components/command/AIInsights.tsx`

**DELETE these two insight blocks from the `useMemo`:**
1. The "Today's production comparison" block — the one with `const avgProduction = 18.5` (was lines ~76-87)
2. The "System health" block — the one with `healthScore` heuristic `85 + (isCharging ? 10 : 0) + (loadKw < 1.5 ? 5 : 0)` (was lines ~108-120)

**KEEP:** battery prediction, optimal window, peak generation, runtime alert.

**Remove unused imports:** `Sun` and `Activity` from lucide-react (if no longer used after removing the two blocks). Keep `todayKwh` in props and deps — it's still used by battery prediction.

### Step 4: Update `src/components/command/EnergyFlowNetwork.tsx`

**Add to interface:**
```typescript
interface EnergyFlowProps {
  solarKw: number;
  batteryPct: number;
  loadKw: number;
  batteryFlowKw: number;
  isCharging: boolean;
  mpptEfficiencyPct?: number | null;
}
```

**Add to destructuring:**
```typescript
export function EnergyFlowNetwork({
  solarKw,
  batteryPct,
  loadKw,
  batteryFlowKw,
  isCharging,
  mpptEfficiencyPct,
}: EnergyFlowProps) {
```

**In the nodes useMemo — change the MPPT node value:**
```typescript
{
  id: "mppt",
  label: "MPPT INVERTER",
  x: 50,
  y: 35,
  value: mpptEfficiencyPct != null && mpptEfficiencyPct > 0
    ? `${mpptEfficiencyPct.toFixed(1)}%`
    : "—",
  color: "#00d4ff",
},
```

**Add `mpptEfficiencyPct` to the nodes useMemo dependency array.**

### Step 5: Update `src/components/command/TopNav.tsx`

1. Remove `const [latency, setLatency] = useState<number>(0);`
2. Remove `setLatency(Math.round(Math.random() * 12 + 4));` from the useEffect interval
3. Remove the entire "Latency" display section (the div with `<Signal>` icon and `{latency}ms`)
4. Remove the `Signal` import from lucide-react (it's no longer used)

---

## Part 2: UI Redesign — Neon Violet Theme

### Color mapping (old → new)

| Role | Old color | New color |
|------|-----------|-----------|
| Background | `#07090f` | `#0a0a14` (violet-black) |
| Card bg (glass) | `rgba(11,13,22,...)` | `rgba(14,14,30,...)` |
| Green/emerald | `#00f593` | `#00ff88` (neon green) |
| Purple | `#a855f7` | `#b14dff` (neon purple) |
| Cyan/electric | `#00d4ff` | `#00e5ff` (neon cyan) |
| Amber | `#f59e0b` | `#ffb800` (neon amber) |
| Red/destructive | `#ff3b5c` | `#ff2d92` (neon pink) |

### Step 6: Update `src/styles.css`

**In `@theme inline` — change ink colors and add neon accents:**
```css
  --color-ink: #0a0a14;
  --color-ink-light: #0e0e1e;
  --color-ink-mid: #141428;
```
Add after the existing colors:
```css
  /* Neon accent colors */
  --color-neon-green: #00ff88;
  --color-neon-purple: #b14dff;
  --color-neon-pink: #ff2d92;
  --color-neon-cyan: #00e5ff;
  --color-neon-amber: #ffb800;
```

**In `:root` — change all `#07090f` to `#0a0a14`, all `rgba(11,13,22,...)` to `rgba(14,14,30,...)`, change `--accent` from `#a855f7` to `#b14dff`.**

**In `.dark` and `@layer base` body — change `#07090f` to `#0a0a14`.**

**Update glass utilities — change all `rgba(11, 13, 22, ...)` to `rgba(14, 14, 30, ...)`:**
- `glass`: `rgba(14, 14, 30, 0.45)`
- `glass-strong`: `rgba(14, 14, 30, 0.6)`
- `glass-glow`: `rgba(14, 14, 30, 0.35)`

**Add new neon card utilities after glass-glow:**
```css
/* ── Neon Card Variants ── */
@utility glass-neon-purple {
  background: rgba(14, 14, 30, 0.45);
  backdrop-filter: blur(40px) saturate(1.4);
  -webkit-backdrop-filter: blur(40px) saturate(1.4);
  border: 1px solid rgba(177, 77, 255, 0.15);
  box-shadow:
    0 0 20px rgba(177, 77, 255, 0.05),
    0 0 0 1px rgba(177, 77, 255, 0.08) inset,
    0 8px 32px rgba(0, 0, 0, 0.5);
}

@utility glass-neon-green {
  background: rgba(14, 14, 30, 0.45);
  backdrop-filter: blur(40px) saturate(1.4);
  -webkit-backdrop-filter: blur(40px) saturate(1.4);
  border: 1px solid rgba(0, 255, 136, 0.15);
  box-shadow:
    0 0 20px rgba(0, 255, 136, 0.05),
    0 0 0 1px rgba(0, 255, 136, 0.08) inset,
    0 8px 32px rgba(0, 0, 0, 0.5);
}

/* ── Neon Button Style ── */
@utility neon-btn {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

@utility neon-glow {
  text-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
}
```

**Update number-glow utilities — change colors to neon:**
```css
@utility number-glow {
  text-shadow:
    0 0 20px rgba(177, 77, 255, 0.15),
    0 0 40px rgba(177, 77, 255, 0.05);
}

@utility number-glow-emerald {
  text-shadow:
    0 0 20px rgba(0, 255, 136, 0.15),
    0 0 40px rgba(0, 255, 136, 0.05);
}

@utility number-glow-purple {
  text-shadow:
    0 0 20px rgba(177, 77, 255, 0.15),
    0 0 40px rgba(177, 77, 255, 0.05);
}
```

### Step 7: Update `src/components/command/AtmosphereBackground.tsx`

- Base bg: `#07090f` → `#0a0a14`
- Night gradient: `rgba(10,5,30,0.3)` → `rgba(20,10,50,0.4)`
- Top right glow: `#00d4ff` → `#b14dff`, opacity `0.04` → `0.06`
- Bottom left glow: `#00f593` → `#00ff88`, opacity `0.03` → `0.05`
- Bottom right glow: `#a855f7` → `#00e5ff`, opacity `0.03` → `0.04`
- Dot grid fill: `#00d4ff` → `#b14dff`
- Vignette: `rgba(7,9,15,0.7)` → `rgba(10,10,20,0.7)`

### Step 8: Update `src/components/command/TopNav.tsx`

**Status colors:**
```typescript
const statusColor = isConnected ? "#00ff88" : isConnecting ? "#ffb800" : "#00e5ff";
```

**Nav container:**
```typescript
background: "rgba(14, 14, 30, 0.65)",
border: "1px solid rgba(177,77,255,0.1)",
boxShadow: "0 0 20px rgba(177,77,255,0.05), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 8px 32px rgba(0,0,0,0.5)",
```

**Brand glow ring:** `rgba(0,212,255,0.2)` → `rgba(177,77,255,0.25)`
**Brand icon container:** `linear-gradient(135deg, rgba(177,77,255,0.2) 0%, rgba(0,229,255,0.15) 100%)`, border `rgba(177,77,255,0.3)`, shadow `rgba(177,77,255,0.2)`
**Brand Zap icon:** `text-[#00d4ff]` → `text-[#b14dff]`
**Brand text gradient:** `linear-gradient(90deg, #e8e8f0 0%, #00d4ff 100%)` → `linear-gradient(90deg, #e8e8f0 0%, #b14dff 100%)`
**Timestamp textShadow:** `rgba(0,212,255,0.2)` → `rgba(177,77,255,0.2)`
**System OK badge:** bg `rgba(177,77,255,0.05)`, border `rgba(177,77,255,0.1)`, dot `#b14dff`
**Device badge:** sim mode — `rgba(177,77,255,...)` + `#b14dff`; live mode — `rgba(0,255,136,...)` + `#00ff88`

### Step 9: Update `src/routes/index.tsx` — KPI cards neon colors

Replace ALL hardcoded color values in kpiCards:
- `#f59e0b` → `#ffb800` (solar, daily yield)
- `#00f593` → `#00ff88` (battery, CO₂ saved, net flow charging)
- `#a855f7` → `#b14dff` (home load, saved USD)
- `#00d4ff` → `#00e5ff` (efficiency)
- `#ff3b5c` → `#ff2d92` (net flow deficit)

**Hero badges:**
- "Systems Nominal": `rgba(0,255,136,...)` + `#00ff88`
- "AI Engine Active": `rgba(177,77,255,...)` + `#b14dff`
- "Peak Charging": `rgba(255,184,0,...)` + `#ffb800`

**Title gradient:** `linear-gradient(90deg, #00d4ff, #00f593)` → `linear-gradient(90deg, #b14dff, #00e5ff)`

**Energy Flow section:**
- Ambient glow: `#00f593` → `#00ff88`, `#f59e0b` → `#ffb800`
- Topology dot: `bg-[#00d4ff]` → `bg-[#b14dff]`, shadow `#00d4ff` → `#b14dff`
- Charging status text/dot: `#00f593` → `#00ff88`, `#f59e0b` → `#ffb800`

**System Impact section:**
- Ambient glow: `#00d4ff` → `#b14dff`
- Energy Generated: `#f59e0b` → `#ffb800`
- Financial Savings: `#00f593` → `#00ff88`
- System Uptime: `#00d4ff` → `#00e5ff`
- Carbon Avoided card: gradient `rgba(177,77,255,0.1), rgba(0,255,136,0.05)`, border `rgba(177,77,255,0.15)`, shadow `rgba(177,77,255,0.1)`, label `#b14dff`

### Step 10: Update `src/components/command/FloatingNav.tsx`

**Container:**
```typescript
background: "rgba(14, 14, 30, 0.75)",
border: "1px solid rgba(177,77,255,0.12)",
boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 20px rgba(177,77,255,0.05), 0 0 0 1px rgba(255,255,255,0.03) inset",
```

**Active pill (isCenter):**
```typescript
background: "linear-gradient(135deg, rgba(177,77,255,0.15), rgba(0,229,255,0.1))",
border: "1px solid rgba(177,77,255,0.2)",
boxShadow: "0 0 20px rgba(177,77,255,0.1)",
```

**Active glow (isCenter):** `rgba(0,212,255,0.2)` → `rgba(177,77,255,0.2)`
**Icon color (isCenter active):** `#00d4ff` → `#b14dff`
**Label color (isCenter active):** `#00f593` → `#00e5ff`

### Step 11: Update `src/components/command/AIInsights.tsx`

**Background flare:** `#a855f7` → `#b14dff`
**AI icon container:** `bg-[#a855f7]/10` → `bg-[#b14dff]/10`, `border-[#a855f7]/20` → `border-[#b14dff]/20`
**Ping animation:** `bg-[#a855f7]` → `bg-[#b14dff]`
**Sparkles icon:** `text-[#a855f7]` → `text-[#b14dff]`
**Active dot:** `bg-[#00f593]` → `bg-[#00ff88]`

**Insight colors (in the useMemo):**
- Battery Forecast: `#00f593` → `#00ff88`
- Optimal Window: `#00d4ff` → `#00e5ff`
- Peak Generation: `#f59e0b` → `#ffb800`
- Runtime Alert: `#ff3b5c` → `#ff2d92`

---

## Verification

After all changes, run these commands and ensure they pass:

```bash
npx tsc --noEmit
```
Expected: 0 errors in the files you touched. (Pre-existing errors in `EnergyGraph.tsx` are OK — do NOT fix them.)

```bash
bun run build
```
Expected: Build succeeds with Vercel output generated.

```bash
bun run dev
```
Expected: Dev server starts, page loads at http://localhost:8080, no console errors, UI shows neon violet theme with no fake values.

---

## Summary of what changed

| Area | What | Why |
|------|------|-----|
| Architecture | New `derived-metrics.ts` module | Single source of truth for derived values |
| Architecture | Removed inline derivation in index.tsx | Prevents formula divergence (was $0.12 vs $0.15) |
| Honesty | Removed 18.5 kWh "30-day avg" | Fabricated — no real 30-day data exists |
| Honesty | Removed "3 trees" claim | Arbitrary number with no basis |
| Honesty | Removed `Math.random()` latency | Fake — not measuring real latency |
| Honesty | Removed `loadKw * 12` "Energy Consumed" | Meaningless multiplication |
| Honesty | Removed `healthScore` heuristic | Fabricated formula, not real health data |
| Honesty | MPPT shows "—" in sim mode | Don't fabricate "98.2%" when no real data |
| UI | Violet-black background (#0a0a14) | Matches reference design |
| UI | Neon accent palette | Modern, vibrant, matches reference |
| UI | Purple/cyan gradients | Brand identity shift from cyan/green to purple/cyan |
