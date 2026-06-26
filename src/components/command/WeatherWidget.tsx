import { motion, AnimatePresence } from "framer-motion";
import { Sunrise, Sunset, Zap, Cloud, Sun } from "lucide-react";
import { useMemo, useEffect, useState } from "react";

type WeatherWidgetProps = {
  peakKw: number;
};

/** Calculate sunrise/sunset using solar position algorithm */
function calcSunTimes(): { sunriseH: number; sunriseM: number; sunsetH: number; sunsetM: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  const lat = (13.7 * Math.PI) / 180;
  const decl = ((23.45 * Math.PI) / 180) * Math.sin(((2 * Math.PI) / 365) * (284 + dayOfYear));
  const cosHa = -Math.tan(lat) * Math.tan(decl);
  const ha = Math.acos(Math.max(-1, Math.min(1, cosHa)));
  const haHours = (ha * (180 / Math.PI)) / 15;
  const noon = 12 - 100.5 / 15 + 7;
  const sunrise = noon - haHours;
  const sunset = noon + haHours;
  const sunriseH = Math.floor(sunrise);
  const sunriseM = Math.floor((sunrise - sunriseH) * 60);
  const sunsetH = Math.floor(sunset);
  const sunsetM = Math.floor((sunset - sunsetH) * 60);
  return { sunriseH, sunriseM, sunsetH, sunsetM };
}

export function WeatherWidget({ peakKw }: WeatherWidgetProps) {
  const peakW = Math.round(peakKw * 1000);
  const now = new Date();
  const currentHour = now.getHours();
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  const currentMin = time.getMinutes();

  const sunTimes = useMemo(() => calcSunTimes(), []);
  const { sunriseH, sunriseM, sunsetH, sunsetM } = sunTimes;

  const totalMinutesNow = currentHour * 60 + currentMin;
  const sunsetTotal = sunsetH * 60 + sunsetM;
  const sunriseTotal = sunriseH * 60 + sunriseM;
  const minutesToSunset = Math.max(0, sunsetTotal - totalMinutesNow);

  const fmt2 = (n: number) => n.toString().padStart(2, "0");
  const sunriseStr = `${fmt2(sunriseH)}:${fmt2(sunriseM)}`;
  const sunsetStr = `${fmt2(sunsetH)}:${fmt2(sunsetM)}`;
  const isDay = totalMinutesNow >= sunriseTotal && totalMinutesNow < sunsetTotal;
  const countdownLabel = isDay
    ? minutesToSunset > 0
      ? `${Math.floor(minutesToSunset / 60)}h ${minutesToSunset % 60}m`
      : "Now"
    : "Night mode";

  // Day progress for the arc visualization
  const dayLength = sunsetTotal - sunriseTotal;
  const dayProgress = isDay ? (totalMinutesNow - sunriseTotal) / dayLength : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass rounded-[32px] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6b6b80]">
          Solar Weather
        </h3>
        <div className="flex items-center gap-1.5">
          {isDay ? (
            <Sun className="h-3.5 w-3.5 text-[#f59e0b]" />
          ) : (
            <Cloud className="h-3.5 w-3.5 text-[#6b6b80]" />
          )}
          <span className="text-[9px] font-medium uppercase tracking-wider text-[#6b6b80]">
            {isDay ? "DAY" : "NIGHT"}
          </span>
        </div>
      </div>

      {/* Sun arc visualization */}
      <div className="relative h-24 mb-4">
        <svg viewBox="0 0 280 96" className="w-full h-full">
          <defs>
            <linearGradient id="sky-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.08" />
            </linearGradient>
            <filter id="sun-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Sun path arc */}
          <path
            d="M 10,85 Q 140,10 270,85"
            fill="none"
            stroke="rgba(245,158,11,0.08)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Sun position */}
          {isDay && (
            <g filter="url(#sun-glow)">
              <circle
                r="10"
                cx={10 + dayProgress * 260}
                cy={85 - Math.sin(dayProgress * Math.PI) * 70}
                fill="#f59e0b"
                opacity={0.8}
              >
                <animate attributeName="r" values="10;11;10" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle
                r="18"
                cx={10 + dayProgress * 260}
                cy={85 - Math.sin(dayProgress * Math.PI) * 70}
                fill="#f59e0b"
                opacity="0.1"
              />
              <circle
                r="28"
                cx={10 + dayProgress * 260}
                cy={85 - Math.sin(dayProgress * Math.PI) * 70}
                fill="#f59e0b"
                opacity="0.05"
              />
            </g>
          )}

          {/* Sky glow fill */}
          {isDay && <path d={`M 10,85 Q 140,10 270,85 L 270,96 L 10,96 Z`} fill="url(#sky-grad)" />}
        </svg>
      </div>

      {/* Info rows */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className="rounded-[16px] p-3"
          style={{
            backgroundColor: "rgba(0,212,255,0.05)",
            border: "1px solid rgba(0,212,255,0.1)",
          }}
        >
          <div className="flex items-center gap-1 mb-1">
            <Sunrise className="h-3 w-3 text-[#00d4ff]" />
            <span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#6b6b80]">
              Rise
            </span>
          </div>
          <span className="text-sm font-bold tabular-nums text-[#00d4ff]">{sunriseStr}</span>
        </div>
        <div
          className="rounded-[16px] p-3"
          style={{
            backgroundColor: "rgba(245,158,11,0.05)",
            border: "1px solid rgba(245,158,11,0.1)",
          }}
        >
          <div className="flex items-center gap-1 mb-1">
            <Zap className="h-3 w-3 text-[#f59e0b]" />
            <span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#6b6b80]">
              Peak
            </span>
          </div>
          <span className="text-sm font-bold tabular-nums text-[#f59e0b]">{peakW}W</span>
        </div>
        <div
          className="rounded-[16px] p-3"
          style={{
            backgroundColor: "rgba(255,59,92,0.05)",
            border: "1px solid rgba(255,59,92,0.1)",
          }}
        >
          <div className="flex items-center gap-1 mb-1">
            <Sunset className="h-3 w-3 text-[#ff3b5c]" />
            <span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#6b6b80]">
              Set
            </span>
          </div>
          <span className="text-sm font-bold tabular-nums text-[#ff3b5c]">{sunsetStr}</span>
        </div>
      </div>

      {/* Countdown */}
      <AnimatePresence mode="wait">
        <motion.div
          key={countdownLabel}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="mt-3 text-center text-[10px] font-medium text-[#6b6b80]"
        >
          {isDay ? `${countdownLabel} until sunset` : "Solar generation offline"}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
