# Solar-X Energy Command Center

Replace the placeholder index with a full-bleed, cinematic solar monitoring experience inspired by Tesla Energy / Vision Pro / JARVIS. Single-page, dark, glassmorphic, animated.

## Scope

Rebuild `src/routes/index.tsx` as the Command Center. No backend, no auth — pure frontend presentation with mock real-time data driven by `useState` + intervals. No 3D engine (Three.js is out of the design-preview envelope and adds heavy weight); the "3D scene" will be a layered SVG + CSS perspective composition with parallax, bloom, and animated energy flow — visually premium, performant, and matches the brief's feel.

## Structure

```text
<CommandCenter>
  ├─ <AtmosphereBackground/>      fixed, full-viewport
  │     gradient + starfield + particles + perspective grid + fog blooms
  ├─ <TopNav/>                    glass, 72px, floating
  ├─ <Hero/>                      ~80vh, 2 cols (40 / 60)
  │     ├─ Left: title, subtitle, 4 floating glass metric cards
  │     └─ Right: <EnergyScene/>  sun → panels → house → battery → grid
  │                               with animated glowing energy lines
  ├─ <BatteryWidget/>             large circular SOC ring w/ orbiting particles
  ├─ <EnergyGraph/>               glass card, 3-line smooth area chart
  ├─ <WeatherWidget/>             floating glass card
  └─ <Footer status strip/>
```

## Design system (added to `src/styles.css`)

- Tokens (oklch equivalents of the brief's hexes):
  - `--background` deep space `#020617`
  - `--solar` `#FACC15`, `--sky` `#38BDF8`, `--leaf` `#10B981`, `--violet` `#8B5CF6`
  - `--fg` `#F8FAFC`, `--muted-fg` `#94A3B8`
  - `--glass-bg` `rgba(255,255,255,0.03)`, `--glass-border` `rgba(255,255,255,0.08)`
  - `--shadow-deep` `0 20px 80px rgba(0,0,0,.35)`
  - `--glow-solar` `0 0 40px rgba(250,204,21,.18)`
  - `--glow-sky`   `0 0 40px rgba(56,189,248,.18)`
- Fonts: load Inter + Space Grotesk via `<link>` in `__root.tsx` head; register `--font-display: "Space Grotesk"`, `--font-sans: "Inter"` in `@theme`.
- Utilities (via `@utility`): `.glass`, `.glass-strong`, `.glow-solar`, `.glow-sky`, `.text-glow-solar`.
- Keyframes: `breathe`, `pulse-glow`, `float-y`, `particle-drift`, `energy-flow` (dashoffset), `ring-fill`, `twinkle`.

## Components (new files under `src/components/command/`)

- `AtmosphereBackground.tsx` — layered: radial gradients, SVG starfield (~120 twinkling dots), 40 drifting particles, CSS perspective-grid floor, two slow-drifting blurred gold/blue blobs (volumetric fog).
- `TopNav.tsx` — left logo + MPPT 6096, center status pills (online dot, temp, live clock via `useEffect` setInterval), right device ID + bell + gear. Glass with `backdrop-filter: blur(24px)`.
- `Hero.tsx` — left column title with "Powered by the Sun" wrapped in a `<span class="text-glow-solar">`. Four floating `MetricCard`s (Solar Input, Battery, Load, Grid) with breathing glow and Framer Motion `whileHover` lift.
- `EnergyScene.tsx` — the centerpiece. SVG + layered divs:
  - Sun: radial-gradient disc with multiple blurred bloom layers, pulsing scale + glow.
  - Solar panels: dark glass quad in CSS 3D perspective, sheen sweep animation.
  - House: stylized isometric SVG (modern silhouette, warm window glow, soft interior light).
  - Battery: tall rounded cell with animated fill + electric arcs.
  - Grid tower: lattice SVG with traveling blue pulses.
  - Energy lines: SVG paths between objects, gradient strokes, animated `stroke-dashoffset`, particle dots tweened along path with Motion.
- `BatteryWidget.tsx` — large SVG ring (78% SOC), conic gradient, animated stroke, orbiting particles via Motion `animate` on rotation, center bolt + label + sublabel.
- `EnergyGraph.tsx` — Recharts `AreaChart` with 3 series (solar/load/battery), smooth monotone curves, gradient fills, hidden axes/grid styling tuned to glass card, custom dark tooltip. Mock 24-point dataset, ticks every 5s via interval to shift the window for a "live" feel.
- `WeatherWidget.tsx` — sun icon w/ rotating ray group, 31°C, UV, sunrise/sunset rows.

## Motion

- Framer Motion (`motion`) for: card entrance (stagger + fade-up), float loops on metric cards, hover lift, sun bloom breathing, energy-line particle traversal, parallax of background blobs to mouse position.
- All easing `[0.22, 1, 0.36, 1]`, durations 0.6–1.8s. No flashy bouncing.

## Data

`src/lib/command-data.ts` — mock generators for live values; small `useLiveMetrics()` hook returning `{ solarKw, batteryPct, loadKw, gridKw, series }` updated every 2s with gentle random walk, so charts and metrics feel alive without backend.

## Dependencies to install

- `framer-motion`
- `recharts`
- `lucide-react` (likely already present; confirm at build time)

## Route head

Update `src/routes/index.tsx` `head()`:
- title: `Solar-X — Energy Command Center`
- description: `Real-time solar, battery, and grid intelligence for the modern home.`
- og:title / og:description matching.

## Out of scope

- No real Three.js / WebGL scene (kept as layered SVG/CSS for performance + reliability).
- No backend, auth, or persistence.
- No additional routes; this is a single landing experience.

After approval I'll implement in one pass and verify visually in the preview at the current mobile viewport plus desktop.
