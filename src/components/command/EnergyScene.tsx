import { motion } from "framer-motion";

/**
 * Layered SVG energy scene: Sun -> Panels -> House -> Battery -> Grid
 * Pure SVG, no 3D engine. Glow, bloom, sheen, and traveling particles.
 */
export function EnergyScene({ solarKw, batteryPct, loadKw }: { solarKw: number; batteryPct: number; loadKw: number }) {
  // Path strings: from->to in 800x600 viewBox
  const sunToPanels = "M 220 150 C 240 220, 260 280, 300 360";
  const panelsToHouse = "M 360 410 C 440 420, 520 420, 580 380";
  const panelsToBattery = "M 330 440 C 320 500, 320 520, 320 560";
  const houseToGrid = "M 650 360 C 720 320, 750 260, 740 180";

  return (
    <div className="relative h-[560px] w-full sm:h-[620px] md:h-[640px]">
      {/* atmosphere bloom behind sun */}
      <div className="pointer-events-none absolute left-[10%] top-[8%] h-72 w-72 rounded-full opacity-70 blur-[80px]" style={{ background: "radial-gradient(circle,#fde68a 0%, rgba(250,204,21,0.4) 30%, transparent 70%)" }} />

      <svg viewBox="0 0 800 640" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="#fff7c2" />
            <stop offset="55%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7" />
          </radialGradient>
          <radialGradient id="sunBloom" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="panelGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0b1220" />
            <stop offset="50%" stopColor="#172033" />
            <stop offset="100%" stopColor="#0b1220" />
          </linearGradient>
          <linearGradient id="houseFace" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="houseRoof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="windowGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="batFill" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="flowSolar" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="flowBlue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient id="flowGreen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <filter id="bloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ENERGY LINES (under objects) */}
        <EnergyLine d={sunToPanels} stroke="url(#flowSolar)" />
        <EnergyLine d={panelsToHouse} stroke="url(#flowGreen)" />
        <EnergyLine d={panelsToBattery} stroke="url(#flowGreen)" />
        <EnergyLine d={houseToGrid} stroke="url(#flowBlue)" reverse />

        {/* SUN */}
        <g style={{ transformOrigin: "200px 130px", animation: "breathe 6s ease-in-out infinite" }}>
          <circle cx="200" cy="130" r="120" fill="url(#sunBloom)" />
          <circle cx="200" cy="130" r="56" fill="url(#sunCore)" filter="url(#bloom)" />
          {/* rays */}
          <g style={{ transformOrigin: "200px 130px", animation: "ray-spin 60s linear infinite" }}>
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              const x1 = 200 + Math.cos(a) * 72;
              const y1 = 130 + Math.sin(a) * 72;
              const x2 = 200 + Math.cos(a) * 96;
              const y2 = 130 + Math.sin(a) * 96;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fde68a" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />;
            })}
          </g>
        </g>

        {/* SOLAR PANELS (isometric quad) */}
        <g transform="translate(260 360)">
          {/* shadow */}
          <ellipse cx="55" cy="105" rx="90" ry="10" fill="#000" opacity="0.45" />
          {/* base/stand */}
          <rect x="48" y="78" width="14" height="22" fill="#1f2937" />
          {/* panel face */}
          <g transform="skewX(-22) translate(0 -10)">
            <rect x="-10" y="0" width="160" height="92" fill="url(#panelGlass)" stroke="#1f2937" strokeWidth="1.5" rx="3" />
            {/* cells grid */}
            {Array.from({ length: 4 }).map((_, r) =>
              Array.from({ length: 7 }).map((_, c) => (
                <rect key={`${r}-${c}`} x={-6 + c * 22} y={4 + r * 22} width="20" height="20" fill="#0b1220" stroke="#1e293b" strokeWidth="0.6" rx="1.5" />
              ))
            )}
            {/* sheen */}
            <rect x="-10" y="0" width="40" height="92" fill="white" opacity="0.08" style={{ animation: "sheen 5s ease-in-out infinite" }} />
          </g>
        </g>

        {/* HOUSE — modern isometric */}
        <g transform="translate(540 280)">
          {/* shadow */}
          <ellipse cx="80" cy="170" rx="120" ry="12" fill="#000" opacity="0.45" />
          {/* main body */}
          <polygon points="0,150 0,70 90,40 90,130" fill="url(#houseFace)" />
          <polygon points="90,40 90,130 170,100 170,30" fill="#0b1424" />
          <polygon points="0,70 90,40 170,30 80,0" fill="url(#houseRoof)" />
          {/* warm window glow */}
          <rect x="14" y="86" width="22" height="30" fill="url(#windowGlow)" opacity="0.9" filter="url(#bloom)" />
          <rect x="46" y="94" width="22" height="22" fill="url(#windowGlow)" opacity="0.75" />
          <rect x="105" y="80" width="18" height="26" fill="url(#windowGlow)" opacity="0.6" />
          <rect x="135" y="68" width="18" height="22" fill="url(#windowGlow)" opacity="0.5" />
          {/* door slit */}
          <rect x="68" y="100" width="10" height="40" fill="#020617" />
          {/* roof solar panel hint */}
          <polygon points="20,62 80,42 80,52 28,72" fill="#0b1220" stroke="#1f2937" strokeWidth="0.6" />
        </g>

        {/* BATTERY */}
        <g transform="translate(260 530)">
          <rect x="0" y="0" width="140" height="70" rx="14" fill="#0b1424" stroke="#1f2937" />
          <rect x="-6" y="22" width="6" height="26" rx="2" fill="#1f2937" />
          {/* fill */}
          <rect x="8" y="8" width={(140 - 16) * (batteryPct / 100)} height="54" rx="10" fill="url(#batFill)" opacity="0.85" />
          <text x="70" y="44" textAnchor="middle" fill="#ecfdf5" fontSize="20" fontWeight="600" fontFamily="Space Grotesk, Inter">
            {batteryPct.toFixed(0)}%
          </text>
          {/* electric arcs */}
          <g stroke="#a7f3d0" strokeWidth="1" fill="none" opacity="0.7">
            <path d="M 20 -4 L 28 4 L 24 8 L 32 18" style={{ animation: "twinkle 1.4s ease-in-out infinite" }} />
            <path d="M 110 -4 L 118 6 L 114 10 L 122 20" style={{ animation: "twinkle 1.8s ease-in-out 0.3s infinite" }} />
          </g>
        </g>

        {/* GRID TOWER */}
        <g transform="translate(690 140)">
          {/* lattice */}
          <polygon points="0,200 36,200 28,0 8,0" fill="#0b1424" stroke="#334155" strokeWidth="1" />
          <line x1="6" y1="40" x2="30" y2="40" stroke="#334155" />
          <line x1="8" y1="80" x2="28" y2="80" stroke="#334155" />
          <line x1="4" y1="120" x2="32" y2="120" stroke="#334155" />
          <line x1="2" y1="160" x2="34" y2="160" stroke="#334155" />
          <line x1="0" y1="200" x2="36" y2="200" stroke="#334155" />
          {/* crossarms */}
          <rect x="-12" y="20" width="60" height="3" fill="#334155" />
          <rect x="-16" y="50" width="68" height="3" fill="#334155" />
          {/* energy pulse */}
          <circle cx="18" cy="20" r="3" fill="#38bdf8" filter="url(#bloom)">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>

      {/* floating labels */}
      <Label x="6%" y="38%" color="#facc15" title="SOLAR" value={`${solarKw.toFixed(2)} kW`} />
      <Label x="34%" y="78%" color="#10b981" title="PANELS" value="ACTIVE" />
      <Label x="64%" y="38%" color="#fde68a" title="HOME" value={`${loadKw.toFixed(2)} kW`} />
      <Label x="20%" y="92%" color="#34d399" title="BATTERY" value={`${batteryPct.toFixed(0)}%`} />
      <Label x="82%" y="22%" color="#38bdf8" title="GRID" value="STANDBY" />
    </div>
  );
}

function EnergyLine({ d, stroke, reverse }: { d: string; stroke: string; reverse?: boolean }) {
  return (
    <g>
      <path d={d} fill="none" stroke={stroke} strokeOpacity="0.18" strokeWidth="6" strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="6 14"
        style={{
          animation: `dash-flow 2.4s linear infinite ${reverse ? "reverse" : ""}`,
          filter: "drop-shadow(0 0 6px currentColor)",
        }}
      />
    </g>
  );
}

function Label({ x, y, color, title, value }: { x: string; y: string; color: string; title: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass absolute -translate-x-1/2 -translate-y-1/2 rounded-xl px-2.5 py-1.5"
      style={{ left: x, top: y, boxShadow: `0 8px 30px rgba(0,0,0,0.4), 0 0 24px ${color}33` }}
    >
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        <span className="font-display text-[9px] font-semibold tracking-[0.18em] text-slate-300">{title}</span>
      </div>
      <div className="mt-0.5 font-display text-[12px] font-semibold tabular-nums" style={{ color }}>{value}</div>
    </motion.div>
  );
}
