import { useMemo } from "react";
import { motion } from "framer-motion";

interface EnergyFlowProps {
  solarKw: number;
  batteryPct: number;
  loadKw: number;
  batteryFlowKw: number;
  isCharging: boolean;
}

type NodeId = "solar" | "mppt" | "battery" | "home" | "grid";

export function EnergyFlowNetwork({
  solarKw,
  batteryPct,
  loadKw,
  batteryFlowKw,
  isCharging,
}: EnergyFlowProps) {
  const nodes = useMemo(
    () => [
      {
        id: "solar",
        label: "SOLAR ARRAY",
        x: 50,
        y: 10,
        value: `${solarKw.toFixed(1)} kW`,
        color: "#f59e0b",
      },
      {
        id: "mppt",
        label: "MPPT INVERTER",
        x: 50,
        y: 35,
        value: "98.2%",
        color: "#00d4ff",
      },
      {
        id: "battery",
        label: "BATTERY BANK",
        x: 18,
        y: 65,
        value: `${batteryPct.toFixed(0)}%`,
        color: "#00f593",
      },
      {
        id: "home",
        label: "HOME LOAD",
        x: 82,
        y: 65,
        value: `${loadKw.toFixed(1)} kW`,
        color: "#a855f7",
      },
      {
        id: "grid",
        label: "UTILITY GRID",
        x: 50,
        y: 90,
        value: isCharging ? "EXPORTING" : "IMPORTING",
        color: "#6b6b80",
      },
    ],
    [solarKw, batteryPct, loadKw, isCharging],
  );

  // Generate particle positions along a path
  const particles = useMemo(() => {
    const result: {
      id: number;
      path: string;
      progress: number;
      color: string;
      size: number;
      speed: number;
    }[] = [];
    let id = 0;

    // Solar → MPPT particles
    const solarToMppt = `M ${nodes[0].x}%,${nodes[0].y + 4}% L ${nodes[1].x}%,${nodes[1].y - 4}%`;
    const numSolarParts = solarKw > 2 ? 5 : solarKw > 0 ? 3 : 0;
    for (let i = 0; i < numSolarParts; i++) {
      result.push({
        id: id++,
        path: solarToMppt,
        progress: (i / numSolarParts) * 100,
        color: "#f59e0b",
        size: 2.5 + Math.random(),
        speed: 1.0 + Math.random() * 0.5,
      });
    }

    // MPPT → Battery (when charging) or Battery → MPPT (when discharging)
    if (isCharging) {
      const mpptToBattery = `M ${nodes[1].x - 4}%,${nodes[1].y + 4}% L ${nodes[2].x + 6}%,${nodes[2].y - 4}%`;
      const numBatParts = Math.abs(batteryFlowKw) > 1 ? 4 : Math.abs(batteryFlowKw) > 0 ? 2 : 0;
      for (let i = 0; i < numBatParts; i++) {
        result.push({
          id: id++,
          path: mpptToBattery,
          progress: (i / numBatParts) * 100,
          color: "#00f593",
          size: 2.5 + Math.random(),
          speed: 1.2 + Math.random() * 0.4,
        });
      }
    } else {
      const batteryToMppt = `M ${nodes[2].x + 6}%,${nodes[2].y + 4}% L ${nodes[1].x - 4}%,${nodes[1].y + 6}%`;
      const numBatParts = Math.abs(batteryFlowKw) > 1 ? 4 : Math.abs(batteryFlowKw) > 0 ? 2 : 0;
      for (let i = 0; i < numBatParts; i++) {
        result.push({
          id: id++,
          path: batteryToMppt,
          progress: (i / numBatParts) * 100,
          color: "#00f593",
          size: 2.5 + Math.random(),
          speed: 0.8 + Math.random() * 0.4,
        });
      }
    }

    // MPPT → Home (always)
    const mpptToHome = `M ${nodes[1].x + 4}%,${nodes[1].y + 4}% L ${nodes[3].x - 6}%,${nodes[3].y - 4}%`;
    const numHomeParts = loadKw > 2 ? 5 : loadKw > 0 ? 3 : 0;
    for (let i = 0; i < numHomeParts; i++) {
      result.push({
        id: id++,
        path: mpptToHome,
        progress: (i / numHomeParts) * 100,
        color: "#a855f7",
        size: 2.5 + Math.random(),
        speed: 1.0 + Math.random() * 0.6,
      });
    }

    // Battery → Home (when discharging) or Home → Battery (when charging)
    if (!isCharging) {
      const batteryToHome = `M ${nodes[2].x + 8}%,${nodes[2].y}% L ${nodes[3].x - 8}%,${nodes[3].y}%`;
      for (let i = 0; i < 2; i++) {
        result.push({
          id: id++,
          path: batteryToHome,
          progress: (i / 2) * 100,
          color: "#a855f7",
          size: 1.5 + Math.random(),
          speed: 0.6 + Math.random() * 0.4,
        });
      }
    }

    // Home → Grid (when exporting) or Grid → Home (when importing)
    if (isCharging) {
      const homeToGrid = `M ${nodes[3].x - 2}%,${nodes[3].y + 4}% L ${nodes[4].x + 2}%,${nodes[4].y - 4}%`;
      for (let i = 0; i < 2; i++) {
        result.push({
          id: id++,
          path: homeToGrid,
          progress: (i / 2) * 100,
          color: "#6b6b80",
          size: 1.5 + Math.random(),
          speed: 0.5 + Math.random() * 0.3,
        });
      }
    } else {
      const gridToHome = `M ${nodes[4].x + 2}%,${nodes[4].y + 4}% L ${nodes[3].x - 2}%,${nodes[3].y + 6}%`;
      for (let i = 0; i < 2; i++) {
        result.push({
          id: id++,
          path: gridToHome,
          progress: (i / 2) * 100,
          color: "#ff3b5c",
          size: 1.5 + Math.random(),
          speed: 0.5 + Math.random() * 0.3,
        });
      }
    }

    return result;
  }, [nodes, solarKw, loadKw, batteryFlowKw, isCharging]);

  return (
    <div className="relative w-full h-full pb-4">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-electric" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="line-solar" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="line-charge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00f593" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="line-discharge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f593" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="line-home" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="line-export" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6b6b80" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="line-import" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#6b6b80" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff3b5c" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* ── Power Lines ── */}

        {/* Solar → MPPT */}
        <path
          d={`M ${nodes[0].x}%,${nodes[0].y + 4}% L ${nodes[1].x}%,${nodes[1].y - 4}%`}
          stroke="url(#line-solar)"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* MPPT → Battery (when charging) / Battery → MPPT (when discharging) */}
        {isCharging ? (
          <path
            d={`M ${nodes[1].x - 4}%,${nodes[1].y + 4}% L ${nodes[2].x + 6}%,${nodes[2].y - 4}%`}
            stroke="url(#line-charge)"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <path
            d={`M ${nodes[2].x + 6}%,${nodes[2].y + 4}% L ${nodes[1].x - 4}%,${nodes[1].y + 6}%`}
            stroke="url(#line-discharge)"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* MPPT → Home */}
        <path
          d={`M ${nodes[1].x + 4}%,${nodes[1].y + 4}% L ${nodes[3].x - 6}%,${nodes[3].y - 4}%`}
          stroke="url(#line-home)"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Battery ↔ Home (direct representation) */}
        {!isCharging && (
          <path
            d={`M ${nodes[2].x + 8}%,${nodes[2].y}% L ${nodes[3].x - 8}%,${nodes[3].y}%`}
            stroke="url(#line-home)"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="3 4"
            opacity="0.4"
          />
        )}

        {/* Home → Grid / Grid → Home */}
        {isCharging ? (
          <path
            d={`M ${nodes[3].x - 2}%,${nodes[3].y + 4}% L ${nodes[4].x + 2}%,${nodes[4].y - 4}%`}
            stroke="url(#line-export)"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="2 4"
            opacity="0.6"
          />
        ) : (
          <path
            d={`M ${nodes[4].x + 2}%,${nodes[4].y + 4}% L ${nodes[3].x - 2}%,${nodes[3].y + 6}%`}
            stroke="url(#line-import)"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="3 5"
            opacity="0.7"
          />
        )}

        {/* ── Moving Particles ── */}
        {particles.map((p) => (
          <g key={p.id}>
            <circle r={p.size} fill={p.color} opacity={1}>
              <animateMotion
                dur={`${p.speed}s`}
                repeatCount="indefinite"
                path={p.path}
                rotate="auto"
              />
            </circle>
            <circle r={p.size * 3} fill={p.color} opacity={0.3}>
              <animateMotion
                dur={`${p.speed}s`}
                repeatCount="indefinite"
                path={p.path}
                rotate="auto"
              />
            </circle>
          </g>
        ))}

        {/* ── Nodes ── */}

        {/* Solar */}
        <g filter="url(#glow-amber)">
          <circle
            cx={`${nodes[0].x}%`}
            cy={`${nodes[0].y}%`}
            r="8"
            fill="rgba(245,158,11,0.2)"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeOpacity={0.6 + solarKw / 10}
          >
            <animate
              attributeName="strokeOpacity"
              values={`${0.4 + solarKw / 12};${0.8 + solarKw / 10};${0.4 + solarKw / 12}`}
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <text
            x={`${nodes[0].x}%`}
            y={`${nodes[0].y + 2.5}%`}
            textAnchor="middle"
            fill="#f59e0b"
            fontSize="6"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            ☀️
          </text>
        </g>

        {/* MPPT */}
        <g filter="url(#glow-electric)">
          <circle
            cx={`${nodes[1].x}%`}
            cy={`${nodes[1].y}%`}
            r="7"
            fill="rgba(0,212,255,0.2)"
            stroke="#00d4ff"
            strokeWidth="1.5"
          >
            <animate attributeName="r" values="6.5;7.5;6.5" dur="3s" repeatCount="indefinite" />
          </circle>
          <text
            x={`${nodes[1].x}%`}
            y={`${nodes[1].y + 2.5}%`}
            textAnchor="middle"
            fill="#00d4ff"
            fontSize="6"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            ⚡
          </text>
        </g>

        {/* Battery */}
        <g filter="url(#glow-emerald)">
          <circle
            cx={`${nodes[2].x}%`}
            cy={`${nodes[2].y}%`}
            r="10"
            fill="rgba(0,245,147,0.15)"
            stroke="#00f593"
            strokeWidth="1.5"
          >
            {isCharging && (
              <animate
                attributeName="strokeWidth"
                values="1.5;2.5;1.5"
                dur="1.5s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          {/* Battery level arc */}
          <path
            d={`M ${nodes[2].x - 6.5}%,${nodes[2].y}% 
                A 6.5 6.5 0 ${batteryPct > 50 ? 1 : 0} 1 ${nodes[2].x + 6.5}%,${nodes[2].y}%`}
            stroke="#00f593"
            strokeWidth="1.5"
            fill="none"
            opacity={0.8 + batteryPct / 200}
            transform={`rotate(0 ${nodes[2].x}% ${nodes[2].y}%)`}
          />
          <text
            x={`${nodes[2].x}%`}
            y={`${nodes[2].y + 2.5}%`}
            textAnchor="middle"
            fill="#00f593"
            fontSize="6"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            🔋
          </text>
        </g>

        {/* Home */}
        <g filter="url(#glow-purple)">
          <circle
            cx={`${nodes[3].x}%`}
            cy={`${nodes[3].y}%`}
            r="9"
            fill="rgba(168,85,247,0.15)"
            stroke="#a855f7"
            strokeWidth="1.5"
          >
            <animate
              attributeName="strokeOpacity"
              values={`${0.4 + loadKw / 8};${0.8 + loadKw / 6};${0.4 + loadKw / 8}`}
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>
          <text
            x={`${nodes[3].x}%`}
            y={`${nodes[3].y + 2.5}%`}
            textAnchor="middle"
            fill="#a855f7"
            fontSize="6"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            🏠
          </text>
        </g>

        {/* Grid */}
        <g filter="url(#glow-electric)">
          <circle
            cx={`${nodes[4].x}%`}
            cy={`${nodes[4].y}%`}
            r="6"
            fill={isCharging ? "rgba(107,107,128,0.1)" : "rgba(255,59,92,0.15)"}
            stroke={isCharging ? "#6b6b80" : "#ff3b5c"}
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <text
            x={`${nodes[4].x}%`}
            y={`${nodes[4].y + 2}%`}
            textAnchor="middle"
            fill={isCharging ? "#6b6b80" : "#ff3b5c"}
            fontSize="5"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            🔌
          </text>
        </g>

        {/* ── Labels & Values ── */}

        {/* Solar label */}
        <text x={`${nodes[0].x}%`} y={`${nodes[0].y - 5.5}%`} textAnchor="middle" fill="#f59e0b" fontSize="2.8" fontWeight="800" fontFamily="Inter, sans-serif" letterSpacing="0.8">
          {nodes[0].label}
        </text>
        <text x={`${nodes[0].x}%`} y={`${nodes[0].y + 7.5}%`} textAnchor="middle" fill="#f59e0b" fontSize="3.5" fontWeight="900" fontFamily="Inter, sans-serif">
          {nodes[0].value}
        </text>

        {/* MPPT label */}
        <text x={`${nodes[1].x + 6}%`} y={`${nodes[1].y + 1}%`} textAnchor="start" fill="#00d4ff" fontSize="2.8" fontWeight="800" fontFamily="Inter, sans-serif" letterSpacing="0.8">
          {nodes[1].label}
        </text>
        <text x={`${nodes[1].x + 6}%`} y={`${nodes[1].y + 4.5}%`} textAnchor="start" fill="#00d4ff" fontSize="3.5" fontWeight="900" fontFamily="Inter, sans-serif" opacity="0.8">
          {nodes[1].value}
        </text>

        {/* Battery label */}
        <text x={`${nodes[2].x}%`} y={`${nodes[2].y - 7.5}%`} textAnchor="middle" fill="#00f593" fontSize="2.8" fontWeight="800" fontFamily="Inter, sans-serif" letterSpacing="0.8">
          {nodes[2].label}
        </text>
        <text x={`${nodes[2].x}%`} y={`${nodes[2].y + 8}%`} textAnchor="middle" fill="#00f593" fontSize="4.5" fontWeight="900" fontFamily="Inter, sans-serif">
          {nodes[2].value}
        </text>
        <text x={`${nodes[2].x}%`} y={`${nodes[2].y + 11.5}%`} textAnchor="middle" fill="#00f593" fontSize="2.5" fontWeight="600" fontFamily="Inter, sans-serif" opacity="0.8">
          {Math.abs(batteryFlowKw)} kW {isCharging ? "IN" : "OUT"}
        </text>

        {/* Home label */}
        <text x={`${nodes[3].x}%`} y={`${nodes[3].y - 7.5}%`} textAnchor="middle" fill="#a855f7" fontSize="2.8" fontWeight="800" fontFamily="Inter, sans-serif" letterSpacing="0.8">
          {nodes[3].label}
        </text>
        <text x={`${nodes[3].x}%`} y={`${nodes[3].y + 8}%`} textAnchor="middle" fill="#a855f7" fontSize="4.5" fontWeight="900" fontFamily="Inter, sans-serif">
          {nodes[3].value}
        </text>

        {/* Grid label */}
        <text x={`${nodes[4].x + 5}%`} y={`${nodes[4].y}%`} textAnchor="start" fill={isCharging ? "#6b6b80" : "#ff3b5c"} fontSize="2.8" fontWeight="800" fontFamily="Inter, sans-serif" letterSpacing="0.8">
          {nodes[4].label}
        </text>
        <text x={`${nodes[4].x + 5}%`} y={`${nodes[4].y + 3.5}%`} textAnchor="start" fill={isCharging ? "#00f593" : "#ff3b5c"} fontSize="3.2" fontWeight="900" fontFamily="Inter, sans-serif">
          {nodes[4].value}
        </text>

        {/* Flow amounts on lines */}
        <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <rect x={`${nodes[0].x - 6}%`} y={`${(nodes[0].y + nodes[1].y) / 2 - 2}%`} width="12" height="4" rx="2" fill="rgba(11,13,22,0.8)" stroke="rgba(245,158,11,0.3)" strokeWidth="0.5" />
          <text x={`${nodes[0].x}%`} y={`${(nodes[0].y + nodes[1].y) / 2 + 0.8}%`} textAnchor="middle" fill="#f59e0b" fontSize="2.8" fontWeight="800" fontFamily="Inter, sans-serif">
            {solarKw.toFixed(1)} kW ↓
          </text>
        </motion.g>

        <motion.g animate={{ x: [0, 2, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
          <rect x={`${(nodes[1].x + nodes[3].x) / 2 - 6}%`} y={`${(nodes[1].y + nodes[3].y) / 2 - 2}%`} width="12" height="4" rx="2" fill="rgba(11,13,22,0.8)" stroke="rgba(168,85,247,0.3)" strokeWidth="0.5" />
          <text x={`${(nodes[1].x + nodes[3].x) / 2}%`} y={`${(nodes[1].y + nodes[3].y) / 2 + 0.8}%`} textAnchor="middle" fill="#a855f7" fontSize="2.8" fontWeight="800" fontFamily="Inter, sans-serif">
            {loadKw.toFixed(1)} kW →
          </text>
        </motion.g>
        
        {isCharging ? (
          <motion.g animate={{ x: [-1, 1, -1] }} transition={{ duration: 2, repeat: Infinity }}>
            <rect x={`${(nodes[1].x + nodes[2].x) / 2 - 6}%`} y={`${(nodes[1].y + nodes[2].y) / 2 - 2}%`} width="12" height="4" rx="2" fill="rgba(11,13,22,0.8)" stroke="rgba(0,245,147,0.3)" strokeWidth="0.5" />
            <text x={`${(nodes[1].x + nodes[2].x) / 2}%`} y={`${(nodes[1].y + nodes[2].y) / 2 + 0.8}%`} textAnchor="middle" fill="#00f593" fontSize="2.8" fontWeight="800" fontFamily="Inter, sans-serif">
               ← {Math.abs(batteryFlowKw).toFixed(1)} kW
            </text>
          </motion.g>
        ) : (
          <motion.g animate={{ x: [-1, 1, -1] }} transition={{ duration: 2, repeat: Infinity }}>
             <rect x={`${(nodes[1].x + nodes[2].x) / 2 - 6}%`} y={`${(nodes[1].y + nodes[2].y) / 2 - 2}%`} width="12" height="4" rx="2" fill="rgba(11,13,22,0.8)" stroke="rgba(0,245,147,0.3)" strokeWidth="0.5" />
             <text x={`${(nodes[1].x + nodes[2].x) / 2}%`} y={`${(nodes[1].y + nodes[2].y) / 2 + 0.8}%`} textAnchor="middle" fill="#00f593" fontSize="2.8" fontWeight="800" fontFamily="Inter, sans-serif">
               {Math.abs(batteryFlowKw).toFixed(1)} kW →
             </text>
          </motion.g>
        )}
      </svg>
    </div>
  );
}
