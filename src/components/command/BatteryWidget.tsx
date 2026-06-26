import { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface BatteryWidgetProps {
  batteryPct: number;
  isCharging: boolean;
  batteryNetW: number;
  todayKwh: number;
  runtimeHours: number;
}

export function BatteryWidget({
  batteryPct,
  isCharging,
  batteryNetW,
  todayKwh,
  runtimeHours,
}: BatteryWidgetProps) {
  const fillHeight = batteryPct;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const batteryColor = useMemo(() => {
    if (batteryPct > 60) return "#00f593";
    if (batteryPct > 30) return "#f59e0b";
    return "#ff3b5c";
  }, [batteryPct]);

  const batteryStatus = useMemo(() => {
    if (isCharging) return { label: "Charging", color: "#00f593" };
    if (batteryPct > 80) return { label: "Full", color: "#00f593" };
    if (batteryPct > 30) return { label: "Discharging", color: "#f59e0b" };
    return { label: "Low Battery", color: "#ff3b5c" };
  }, [isCharging, batteryPct]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="glass rounded-[32px] p-5 flex flex-col items-center"
      style={{
        boxShadow: `0 0 40px ${batteryColor}08, 0 8px 32px rgba(0,0,0,0.5)`,
      }}
    >
      <div className="w-full flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6b6b80]">
          Battery Reserve
        </h3>
        {/* Status badge */}
        <div
          className="rounded-full px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em]"
          style={{
            backgroundColor: `${batteryStatus.color}12`,
            border: `1px solid ${batteryStatus.color}25`,
            color: batteryStatus.color,
          }}
        >
          {batteryStatus.label}
        </div>
      </div>

      {/* Glass Cylinder */}
      <div className="relative w-24 h-48 mb-5" ref={ref}>
        <svg viewBox="0 0 96 192" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="glass-body" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="15%" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.04)" />
              <stop offset="85%" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
            </linearGradient>
            <linearGradient id="liquid-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={batteryColor} stopOpacity="0.9" />
              <stop offset="50%" stopColor={batteryPct > 60 ? "#00d4ff" : batteryColor} stopOpacity="0.65" />
              <stop offset="100%" stopColor={batteryColor} stopOpacity="1" />
            </linearGradient>
            <filter id="battery-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background fill */}
          <rect x="8" y="8" width="80" height="176" rx="14" fill="rgba(0,0,0,0.45)" />

          {/* Liquid fill - animated */}
          <motion.g>
            <clipPath id="liquid-clip">
              <rect
                x="8"
                y={inView ? 192 - (fillHeight / 100) * 176 - 8 : 184}
                width="80"
                height={inView ? (fillHeight / 100) * 176 : 0}
                rx="14"
              />
            </clipPath>

            {/* Liquid body */}
            <rect
              x="8"
              y="8"
              width="80"
              height="176"
              rx="14"
              fill="url(#liquid-grad)"
              clipPath="url(#liquid-clip)"
              filter="url(#battery-glow)"
            >
              {isCharging && (
                <animate attributeName="opacity" values="0.85;1;0.85" dur="1.8s" repeatCount="indefinite" />
              )}
            </rect>

            {/* Liquid surface wave */}
            <path
              d={`M 8,${192 - (fillHeight / 100) * 176 - 8} 
                  Q 20,${192 - (fillHeight / 100) * 176 - 12} 30,${192 - (fillHeight / 100) * 176 - 8}
                  Q 40,${192 - (fillHeight / 100) * 176 - 4} 50,${192 - (fillHeight / 100) * 176 - 8}
                  Q 60,${192 - (fillHeight / 100) * 176 - 12} 70,${192 - (fillHeight / 100) * 176 - 8}
                  Q 80,${192 - (fillHeight / 100) * 176 - 4} 88,${192 - (fillHeight / 100) * 176 - 8}
                  L 88,${192 - (fillHeight / 100) * 176 + 4}
                  L 8,${192 - (fillHeight / 100) * 176 + 4} Z`}
              fill={`${batteryColor}40`}
              clipPath="url(#liquid-clip)"
            >
              <animate
                attributeName="d"
                values={`
                  M 8,${192 - (fillHeight / 100) * 176 - 8} 
                  Q 20,${192 - (fillHeight / 100) * 176 - 12} 30,${192 - (fillHeight / 100) * 176 - 8}
                  Q 40,${192 - (fillHeight / 100) * 176 - 4} 50,${192 - (fillHeight / 100) * 176 - 8}
                  Q 60,${192 - (fillHeight / 100) * 176 - 12} 70,${192 - (fillHeight / 100) * 176 - 8}
                  Q 80,${192 - (fillHeight / 100) * 176 - 4} 88,${192 - (fillHeight / 100) * 176 - 8}
                  L 88,${192 - (fillHeight / 100) * 176 + 4}
                  L 8,${192 - (fillHeight / 100) * 176 + 4} Z;
                  M 8,${192 - (fillHeight / 100) * 176 - 6} 
                  Q 20,${192 - (fillHeight / 100) * 176 - 2} 30,${192 - (fillHeight / 100) * 176 - 6}
                  Q 40,${192 - (fillHeight / 100) * 176 - 10} 50,${192 - (fillHeight / 100) * 176 - 6}
                  Q 60,${192 - (fillHeight / 100) * 176 - 2} 70,${192 - (fillHeight / 100) * 176 - 6}
                  Q 80,${192 - (fillHeight / 100) * 176 - 10} 88,${192 - (fillHeight / 100) * 176 - 6}
                  L 88,${192 - (fillHeight / 100) * 176 + 4}
                  L 8,${192 - (fillHeight / 100) * 176 + 4} Z;
                  M 8,${192 - (fillHeight / 100) * 176 - 8} 
                  Q 20,${192 - (fillHeight / 100) * 176 - 12} 30,${192 - (fillHeight / 100) * 176 - 8}
                  Q 40,${192 - (fillHeight / 100) * 176 - 4} 50,${192 - (fillHeight / 100) * 176 - 8}
                  Q 60,${192 - (fillHeight / 100) * 176 - 12} 70,${192 - (fillHeight / 100) * 176 - 8}
                  Q 80,${192 - (fillHeight / 100) * 176 - 4} 88,${192 - (fillHeight / 100) * 176 - 8}
                  L 88,${192 - (fillHeight / 100) * 176 + 4}
                  L 8,${192 - (fillHeight / 100) * 176 + 4} Z`}
                dur="3s"
                repeatCount="indefinite"
              />
            </path>

            {/* Bubble particles when charging */}
            {isCharging && (
              <>
                <circle cx="30" cy="140" r="1.5" fill="rgba(255,255,255,0.45)" clipPath="url(#liquid-clip)">
                  <animate attributeName="cy" values="160;40" dur="2.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0" dur="2.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="50" cy="120" r="1" fill="rgba(255,255,255,0.35)" clipPath="url(#liquid-clip)">
                  <animate attributeName="cy" values="150;50" dur="3.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0" dur="3.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="65" cy="130" r="1.2" fill="rgba(255,255,255,0.4)" clipPath="url(#liquid-clip)">
                  <animate attributeName="cy" values="145;35" dur="3.3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0" dur="3.3s" repeatCount="indefinite" />
                </circle>
              </>
            )}
          </motion.g>

          {/* Glass container outline */}
          <rect
            x="8"
            y="8"
            width="80"
            height="176"
            rx="14"
            fill="none"
            stroke={`${batteryColor}20`}
            strokeWidth="1.5"
          />

          {/* Left reflection highlight */}
          <rect x="12" y="16" width="5" height="160" rx="2.5" fill="rgba(255,255,255,0.04)" />
          <rect x="14" y="40" width="2" height="80" rx="1" fill="rgba(255,255,255,0.06)" />

          {/* Top cap */}
          <rect x="28" y="2" width="40" height="8" rx="4" fill="rgba(255,255,255,0.1)" />
          <rect x="34" y="0" width="28" height="4" rx="2" fill="rgba(255,255,255,0.12)" />

          {/* Terminal dots */}
          <circle cx="38" cy="4" r="1.5" fill="rgba(255,255,255,0.2)" />
          <circle cx="58" cy="4" r="1.5" fill="rgba(255,255,255,0.2)" />

          {/* Charging bolt */}
          {isCharging && (
            <g filter="url(#battery-glow)">
              <text
                x="48"
                y="104"
                textAnchor="middle"
                fill={batteryColor}
                fontSize="18"
                fontWeight="900"
                opacity="0.6"
              >
                ⚡
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" />
              </text>
            </g>
          )}
        </svg>

        {/* Percentage overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.span
            className="text-4xl font-black tabular-nums"
            style={{ fontFamily: "Inter, sans-serif", color: batteryColor, textShadow: `0 0 30px ${batteryColor}40` }}
          >
            {batteryPct.toFixed(0)}
          </motion.span>
          <span className="text-xs font-bold mt-6 ml-0.5" style={{ color: batteryColor }}>
            %
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="w-full grid grid-cols-2 gap-2">
        <div
          className="rounded-[16px] p-3 text-center"
          style={{
            backgroundColor: `${isCharging ? "#00f593" : "#ff3b5c"}0a`,
            border: `1px solid ${isCharging ? "#00f593" : "#ff3b5c"}1a`,
          }}
        >
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6b6b80] mb-1">
            Net Power
          </div>
          <div
            className="text-base font-black tabular-nums"
            style={{ color: isCharging ? "#00f593" : "#ff3b5c", textShadow: `0 0 20px ${isCharging ? "#00f593" : "#ff3b5c"}30` }}
          >
            {isCharging ? "+" : "-"}
            {batteryNetW}
            <span className="text-[10px] font-medium text-[#6b6b80] ml-1">W</span>
          </div>
        </div>
        <div
          className="rounded-[16px] p-3 text-center"
          style={{
            backgroundColor: "rgba(0,212,255,0.05)",
            border: "1px solid rgba(0,212,255,0.12)",
          }}
        >
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6b6b80] mb-1">
            Runtime
          </div>
          <div className="text-base font-black tabular-nums" style={{ color: "#00d4ff", textShadow: "0 0 20px rgba(0,212,255,0.3)" }}>
            {runtimeHours > 24 ? "24+" : runtimeHours.toFixed(1)}
            <span className="text-[10px] font-medium text-[#6b6b80] ml-1">hrs</span>
          </div>
        </div>
      </div>

      {/* Today kWh */}
      <div className="w-full mt-2 rounded-[16px] p-2.5 flex items-center justify-between"
        style={{
          backgroundColor: "rgba(245,158,11,0.05)",
          border: "1px solid rgba(245,158,11,0.1)",
        }}
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6b6b80]">Today Yield</span>
        <span className="text-sm font-black tabular-nums text-[#f59e0b]">
          {todayKwh.toFixed(1)} <span className="text-[10px] font-medium text-[#6b6b80]">kWh</span>
        </span>
      </div>
    </motion.div>
  );
}
