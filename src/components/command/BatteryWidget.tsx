import { motion } from "framer-motion";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass rounded-[32px] p-5 flex flex-col items-center"
    >
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6b6b80] mb-5">
        Battery Reserve
      </h3>

      {/* Glass Cylinder */}
      <div className="relative w-24 h-48 mb-5">
        {/* Outer glass container */}
        <svg viewBox="0 0 96 192" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* Glass cylinder gradient */}
            <linearGradient id="glass-body" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="15%" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.04)" />
              <stop offset="85%" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
            </linearGradient>
            {/* Liquid gradient */}
            <linearGradient id="liquid-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f593" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#00d4ff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#00f593" stopOpacity="0.9" />
            </linearGradient>
            {/* Top reflective shine */}
            <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
            </linearGradient>
            {/* Glow filter */}
            <filter id="battery-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Inner shadow */}
            <filter id="inner-glass">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
              <feOffset dx="0" dy="1" />
              <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background fill - dim when low */}
          <rect x="8" y="8" width="80" height="176" rx="12" fill="rgba(0,0,0,0.4)" />

          {/* Liquid fill - animated */}
          <motion.g>
            <clipPath id="liquid-clip">
              <rect
                x="8"
                y={192 - (fillHeight / 100) * 176 - 8}
                width="80"
                height={(fillHeight / 100) * 176}
                rx="12"
              />
            </clipPath>

            {/* Liquid body */}
            <rect
              x="8"
              y="8"
              width="80"
              height="176"
              rx="12"
              fill="url(#liquid-grad)"
              clipPath="url(#liquid-clip)"
              filter="url(#battery-glow)"
            >
              {isCharging && (
                <animate
                  attributeName="opacity"
                  values="0.8;1;0.8"
                  dur="2s"
                  repeatCount="indefinite"
                />
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
              fill="rgba(0,245,147,0.3)"
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

            {/* Bubble particles */}
            {isCharging && (
              <>
                <circle cx="30" cy="140" r="1.5" fill="rgba(255,255,255,0.4)">
                  <animate attributeName="cy" values="160;40" dur="3s" repeatCount="indefinite" />
                  <animate
                    attributeName="opacity"
                    values="0.6;0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="50" cy="120" r="1" fill="rgba(255,255,255,0.3)">
                  <animate attributeName="cy" values="150;50" dur="4s" repeatCount="indefinite" />
                  <animate
                    attributeName="opacity"
                    values="0.5;0"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="65" cy="130" r="1.2" fill="rgba(255,255,255,0.35)">
                  <animate attributeName="cy" values="145;35" dur="3.5s" repeatCount="indefinite" />
                  <animate
                    attributeName="opacity"
                    values="0.4;0"
                    dur="3.5s"
                    repeatCount="indefinite"
                  />
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
            rx="12"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />

          {/* Left reflection highlight */}
          <rect x="12" y="12" width="6" height="168" rx="3" fill="rgba(255,255,255,0.04)" />
          <rect x="14" y="40" width="2" height="80" rx="1" fill="rgba(255,255,255,0.06)" />

          {/* Top cap */}
          <rect x="28" y="2" width="40" height="8" rx="4" fill="rgba(255,255,255,0.08)" />
          <rect x="34" y="0" width="28" height="4" rx="2" fill="rgba(255,255,255,0.1)" />

          {/* Terminal dots */}
          <circle cx="38" cy="4" r="1.5" fill="rgba(255,255,255,0.15)" />
          <circle cx="58" cy="4" r="1.5" fill="rgba(255,255,255,0.15)" />

          {/* Charging indicator */}
          {isCharging && (
            <g filter="url(#battery-glow)">
              <text
                x="48"
                y="100"
                textAnchor="middle"
                fill="#00f593"
                fontSize="14"
                fontWeight="800"
                fontFamily="Inter, sans-serif"
                opacity="0.5"
              >
                ⚡
                <animate
                  attributeName="opacity"
                  values="0.3;0.7;0.3"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </text>
            </g>
          )}
        </svg>

        {/* Percentage overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.span
            className="text-4xl font-bold tabular-nums number-glow-emerald"
            style={{ fontFamily: "Inter, sans-serif", color: "#00f593" }}
          >
            {batteryPct.toFixed(0)}
          </motion.span>
          <span className="text-xs font-semibold text-[#00f593] mt-6 ml-0.5">%</span>
        </div>
      </div>

      {/* Stats below */}
      <div className="w-full grid grid-cols-2 gap-2 mt-2">
        <div
          className="rounded-[16px] p-3 text-center"
          style={{
            backgroundColor: "rgba(0,245,147,0.05)",
            border: "1px solid rgba(0,245,147,0.1)",
          }}
        >
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6b6b80] mb-1">
            Net Power
          </div>
          <div
            className="text-base font-bold tabular-nums"
            style={{ color: isCharging ? "#00f593" : "#ff3b5c" }}
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
            border: "1px solid rgba(0,212,255,0.1)",
          }}
        >
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6b6b80] mb-1">
            Runtime
          </div>
          <div className="text-base font-bold tabular-nums" style={{ color: "#00d4ff" }}>
            {runtimeHours > 24 ? "24+" : runtimeHours.toFixed(1)}
            <span className="text-[10px] font-medium text-[#6b6b80] ml-1">hrs</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
