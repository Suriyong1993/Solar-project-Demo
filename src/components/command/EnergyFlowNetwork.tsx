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
  const nodes: {
    id: NodeId;
    label: string;
    x: number;
    y: number;
    value: string;
    color: string;
    glowColor: string;
    icon: string;
  }[] = useMemo(
    () => [
      {
        id: "solar",
        label: "SOLAR",
        x: 50,
        y: 5,
        value: `${solarKw.toFixed(1)} kW`,
        color: "#f59e0b",
        glowColor: "rgba(245,158,11,0.3)",
        icon: "☀️",
      },
      {
        id: "mppt",
        label: "MPPT",
        x: 50,
        y: 22,
        value: "98.2%",
        color: "#00d4ff",
        glowColor: "rgba(0,212,255,0.3)",
        icon: "⚡",
      },
      {
        id: "battery",
        label: "BATTERY",
        x: 22,
        y: 55,
        value: `${batteryPct.toFixed(0)}%`,
        color: "#00f593",
        glowColor: "rgba(0,245,147,0.3)",
        icon: "🔋",
      },
      {
        id: "home",
        label: "HOME",
        x: 78,
        y: 55,
        value: `${loadKw.toFixed(1)} kW`,
        color: "#a855f7",
        glowColor: "rgba(168,85,247,0.3)",
        icon: "🏠",
      },
      {
        id: "grid",
        label: "GRID",
        x: 50,
        y: 82,
        value: isCharging ? "EXPORT" : "IMPORT",
        color: "#6b6b80",
        glowColor: "rgba(107,107,128,0.2)",
        icon: "🔌",
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
    const solarToMppt = `M ${nodes[0].x}%,${nodes[0].y + 3}% L ${nodes[1].x}%,${nodes[1].y - 3}%`;
    for (let i = 0; i < 4; i++) {
      result.push({
        id: id++,
        path: solarToMppt,
        progress: (i / 4) * 100,
        color: "#f59e0b",
        size: 2 + Math.random(),
        speed: 1.2 + Math.random() * 0.8,
      });
    }

    // MPPT → Battery (when charging) or Battery → MPPT (when discharging)
    if (isCharging) {
      const mpptToBattery = `M ${nodes[1].x - 3}%,${nodes[1].y + 3}% L ${nodes[2].x + 5}%,${nodes[2].y - 3}%`;
      for (let i = 0; i < 3; i++) {
        result.push({
          id: id++,
          path: mpptToBattery,
          progress: (i / 3) * 100,
          color: "#00f593",
          size: 2 + Math.random(),
          speed: 1.0 + Math.random() * 0.5,
        });
      }
    } else {
      const batteryToMppt = `M ${nodes[2].x + 5}%,${nodes[2].y + 3}% L ${nodes[1].x - 3}%,${nodes[1].y + 5}%`;
      for (let i = 0; i < 3; i++) {
        result.push({
          id: id++,
          path: batteryToMppt,
          progress: (i / 3) * 100,
          color: "#00f593",
          size: 2 + Math.random(),
          speed: 0.8 + Math.random() * 0.5,
        });
      }
    }

    // MPPT → Home (always)
    const mpptToHome = `M ${nodes[1].x + 3}%,${nodes[1].y + 3}% L ${nodes[3].x - 5}%,${nodes[3].y - 3}%`;
    for (let i = 0; i < 3; i++) {
      result.push({
        id: id++,
        path: mpptToHome,
        progress: (i / 3) * 100,
        color: "#a855f7",
        size: 2 + Math.random(),
        speed: 1.0 + Math.random() * 0.8,
      });
    }

    // Battery → Home (when discharging) or Home → Battery (when charging)
    if (!isCharging) {
      const batteryToHome = `M ${nodes[2].x + 6}%,${nodes[2].y}% L ${nodes[3].x - 6}%,${nodes[3].y}%`;
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
      const homeToGrid = `M ${nodes[3].x - 2}%,${nodes[3].y + 3}% L ${nodes[4].x}%,${nodes[4].y - 3}%`;
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
      const gridToHome = `M ${nodes[4].x}%,${nodes[4].y + 3}% L ${nodes[3].x - 2}%,${nodes[3].y + 5}%`;
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
  }, [nodes, isCharging]);

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Glow filters */}
          <filter id="glow-amber">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-electric">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-emerald">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-purple">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradients for power lines */}
          <linearGradient id="line-solar" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="line-charge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00f593" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="line-discharge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f593" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="line-home" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="line-export" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6b6b80" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="line-import" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#6b6b80" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ff3b5c" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* ── Power Lines ── */}

        {/* Solar → MPPT */}
        <path
          d={`M ${nodes[0].x}%,${nodes[0].y + 3}% L ${nodes[1].x}%,${nodes[1].y - 3}%`}
          stroke="url(#line-solar)"
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
        />

        {/* MPPT → Battery (when charging) / Battery → MPPT (when discharging) */}
        {isCharging ? (
          <path
            d={`M ${nodes[1].x - 3}%,${nodes[1].y + 3}% L ${nodes[2].x + 5}%,${nodes[2].y - 3}%`}
            stroke="url(#line-charge)"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <path
            d={`M ${nodes[2].x + 5}%,${nodes[2].y + 3}% L ${nodes[1].x - 3}%,${nodes[1].y + 5}%`}
            stroke="url(#line-discharge)"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* MPPT → Home */}
        <path
          d={`M ${nodes[1].x + 3}%,${nodes[1].y + 3}% L ${nodes[3].x - 5}%,${nodes[3].y - 3}%`}
          stroke="url(#line-home)"
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Battery ↔ Home */}
        {!isCharging && (
          <path
            d={`M ${nodes[2].x + 6}%,${nodes[2].y}% L ${nodes[3].x - 6}%,${nodes[3].y}%`}
            stroke="url(#line-home)"
            strokeWidth="0.6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="2 3"
            opacity="0.5"
          />
        )}

        {/* Home → Grid / Grid → Home */}
        {isCharging ? (
          <path
            d={`M ${nodes[3].x - 2}%,${nodes[3].y + 3}% L ${nodes[4].x}%,${nodes[4].y - 3}%`}
            stroke="url(#line-export)"
            strokeWidth="0.6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="2 3"
            opacity="0.5"
          />
        ) : (
          <path
            d={`M ${nodes[4].x}%,${nodes[4].y + 3}% L ${nodes[3].x - 2}%,${nodes[3].y + 5}%`}
            stroke="url(#line-import)"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="3 4"
            opacity="0.6"
          />
        )}

        {/* ── Moving Particles ── */}
        {particles.map((p) => (
          <g key={p.id}>
            <circle r={p.size} fill={p.color} opacity={0.9}>
              <animateMotion
                dur={`${p.speed}s`}
                repeatCount="indefinite"
                path={p.path}
                rotate="auto"
              />
            </circle>
            <circle r={p.size * 2.5} fill={p.color} opacity={0.2}>
              <animateMotion
                dur={`${p.speed}s`}
                repeatCount="indefinite"
                path={p.path}
                rotate="auto"
              />
            </circle>
          </g>
        ))}

        {/* ── Node Background Connections ── */}
        {/* MPPT center point */}
        <circle cx={`${nodes[1].x}%`} cy={`${nodes[1].y}%`} r="4" fill="#00d4ff" opacity="0.08" />

        {/* ── Nodes ── */}

        {/* Solar */}
        <g filter="url(#glow-amber)">
          <circle
            cx={`${nodes[0].x}%`}
            cy={`${nodes[0].y}%`}
            r="6"
            fill="rgba(245,158,11,0.15)"
            stroke="#f59e0b"
            strokeWidth="0.8"
            strokeOpacity={0.5 + solarKw / 10}
          >
            <animate
              attributeName="strokeOpacity"
              values={`${0.3 + solarKw / 12};${0.6 + solarKw / 10};${0.3 + solarKw / 12}`}
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <text
            x={`${nodes[0].x}%`}
            y={`${nodes[0].y + 2}%`}
            textAnchor="middle"
            fill="#f59e0b"
            fontSize="5"
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
            r="6"
            fill="rgba(0,212,255,0.15)"
            stroke="#00d4ff"
            strokeWidth="0.8"
          >
            <animate attributeName="r" values="5.8;6.2;5.8" dur="3s" repeatCount="indefinite" />
          </circle>
          <text
            x={`${nodes[1].x}%`}
            y={`${nodes[1].y + 2}%`}
            textAnchor="middle"
            fill="#00d4ff"
            fontSize="5"
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
            r="8"
            fill="rgba(0,245,147,0.1)"
            stroke="#00f593"
            strokeWidth="0.8"
          >
            {isCharging && (
              <animate
                attributeName="strokeWidth"
                values="0.8;1.5;0.8"
                dur="1.5s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          {/* Battery level arc */}
          <path
            d={`M ${nodes[2].x - 5}%,${nodes[2].y}% 
                A 5 5 0 ${batteryPct > 50 ? 1 : 0} 1 ${nodes[2].x + 5}%,${nodes[2].y}%`}
            stroke="#00f593"
            strokeWidth="0.6"
            fill="none"
            opacity={0.6 + batteryPct / 200}
            transform={`rotate(0 ${nodes[2].x}% ${nodes[2].y}%)`}
          />
          <text
            x={`${nodes[2].x}%`}
            y={`${nodes[2].y + 2}%`}
            textAnchor="middle"
            fill="#00f593"
            fontSize="5"
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
            r="7"
            fill="rgba(168,85,247,0.1)"
            stroke="#a855f7"
            strokeWidth="0.8"
          >
            <animate
              attributeName="strokeOpacity"
              values={`${0.3 + loadKw / 8};${0.6 + loadKw / 6};${0.3 + loadKw / 8}`}
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>
          <text
            x={`${nodes[3].x}%`}
            y={`${nodes[3].y + 2}%`}
            textAnchor="middle"
            fill="#a855f7"
            fontSize="5"
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
            r="5"
            fill={isCharging ? "rgba(107,107,128,0.05)" : "rgba(255,59,92,0.08)"}
            stroke={isCharging ? "#6b6b80" : "#ff3b5c"}
            strokeWidth="0.6"
            strokeDasharray="2 2"
          />
          <text
            x={`${nodes[4].x}%`}
            y={`${nodes[4].y + 2}%`}
            textAnchor="middle"
            fill={isCharging ? "#6b6b80" : "#ff3b5c"}
            fontSize="4"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            🔌
          </text>
        </g>

        {/* ── Labels ── */}
        {/* Solar label */}
        <text
          x={`${nodes[0].x}%`}
          y={`${nodes[0].y - 3.5}%`}
          textAnchor="middle"
          fill="#f59e0b"
          fontSize="2.5"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
          letterSpacing="0.5"
        >
          SOLAR
        </text>

        {/* MPPT label */}
        <text
          x={`${nodes[1].x}%`}
          y={`${nodes[1].y - 3.5}%`}
          textAnchor="middle"
          fill="#00d4ff"
          fontSize="2.5"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
          letterSpacing="0.5"
        >
          MPPT
        </text>

        {/* Battery label */}
        <text
          x={`${nodes[2].x}%`}
          y={`${nodes[2].y + 5.5}%`}
          textAnchor="middle"
          fill="#00f593"
          fontSize="2.8"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {batteryPct.toFixed(0)}%
        </text>
        <text
          x={`${nodes[2].x}%`}
          y={`${nodes[2].y + 7.5}%`}
          textAnchor="middle"
          fill="#00f593"
          fontSize="1.8"
          fontWeight="500"
          fontFamily="Inter, sans-serif"
          opacity="0.6"
        >
          BATTERY
        </text>

        {/* Home label */}
        <text
          x={`${nodes[3].x}%`}
          y={`${nodes[3].y + 5}%`}
          textAnchor="middle"
          fill="#a855f7"
          fontSize="2.8"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {loadKw.toFixed(1)} kW
        </text>
        <text
          x={`${nodes[3].x}%`}
          y={`${nodes[3].y + 7}%`}
          textAnchor="middle"
          fill="#a855f7"
          fontSize="1.8"
          fontWeight="500"
          fontFamily="Inter, sans-serif"
          opacity="0.6"
        >
          HOME
        </text>

        {/* Grid label */}
        <text
          x={`${nodes[4].x}%`}
          y={`${nodes[4].y + 4.5}%`}
          textAnchor="middle"
          fill={isCharging ? "#6b6b80" : "#ff3b5c"}
          fontSize="2"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
        >
          GRID
        </text>
        <text
          x={`${nodes[4].x}%`}
          y={`${nodes[4].y + 6.5}%`}
          textAnchor="middle"
          fill={isCharging ? "#00f593" : "#ff3b5c"}
          fontSize="2.2"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {isCharging ? "EXPORT" : "IMPORT"}
        </text>

        {/* Solar value label */}
        <text
          x={`${nodes[0].x}%`}
          y={`${nodes[0].y + 5}%`}
          textAnchor="middle"
          fill="#f59e0b"
          fontSize="2.5"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
        >
          {solarKw.toFixed(1)} kW
        </text>

        {/* Flow arrows on lines */}
        {/* Solar → MPPT arrow */}
        <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <text
            x={`${(nodes[0].x + nodes[1].x) / 2}%`}
            y={`${(nodes[0].y + nodes[1].y) / 2 + 1}%`}
            textAnchor="middle"
            fill="#f59e0b"
            fontSize="2"
            opacity="0.6"
            fontFamily="monospace"
          >
            ▼
          </text>
        </motion.g>

        {/* MPPT → Home arrow */}
        <motion.g animate={{ x: [0, 2, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
          <text
            x={`${(nodes[1].x + nodes[3].x) / 2}%`}
            y={`${(nodes[1].y + nodes[3].y) / 2 + 1}%`}
            textAnchor="middle"
            fill="#a855f7"
            fontSize="2"
            opacity="0.6"
            fontFamily="monospace"
          >
            ▶
          </text>
        </motion.g>

        {/* Charging/Discharging arrow */}
        {isCharging ? (
          <motion.g animate={{ x: [-1, 1, -1] }} transition={{ duration: 2, repeat: Infinity }}>
            <text
              x={`${(nodes[1].x + nodes[2].x) / 2 - 1}%`}
              y={`${(nodes[1].y + nodes[2].y) / 2 + 1}%`}
              textAnchor="middle"
              fill="#00f593"
              fontSize="2"
              opacity="0.7"
              fontFamily="monospace"
            >
              ◀
            </text>
          </motion.g>
        ) : (
          <motion.g animate={{ x: [-1, 1, -1] }} transition={{ duration: 2, repeat: Infinity }}>
            <text
              x={`${(nodes[1].x + nodes[2].x) / 2 + 1}%`}
              y={`${(nodes[1].y + nodes[2].y) / 2 + 1}%`}
              textAnchor="middle"
              fill="#00f593"
              fontSize="2"
              opacity="0.7"
              fontFamily="monospace"
            >
              ▶
            </text>
          </motion.g>
        )}

        {/* Export/Import arrow */}
        {isCharging ? (
          <motion.g animate={{ y: [0, 2, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <text
              x={`${(nodes[3].x + nodes[4].x) / 2}%`}
              y={`${(nodes[3].y + nodes[4].y) / 2 + 1}%`}
              textAnchor="middle"
              fill="#6b6b80"
              fontSize="2"
              opacity="0.5"
              fontFamily="monospace"
            >
              ▼
            </text>
          </motion.g>
        ) : (
          <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <text
              x={`${(nodes[3].x + nodes[4].x) / 2}%`}
              y={`${(nodes[3].y + nodes[4].y) / 2 + 1}%`}
              textAnchor="middle"
              fill="#ff3b5c"
              fontSize="2"
              opacity="0.6"
              fontFamily="monospace"
            >
              ▲
            </text>
          </motion.g>
        )}
      </svg>
    </div>
  );
}
