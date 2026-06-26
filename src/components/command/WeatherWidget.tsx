import { motion, AnimatePresence } from "framer-motion";
import { Sunrise, Sunset, Zap, Cloud, Sun, Moon, Stars } from "lucide-react";
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

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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
  const minutesToSunrise = Math.max(0, (totalMinutesNow > sunsetTotal ? 1440 - totalMinutesNow + sunriseTotal : sunriseTotal - totalMinutesNow));

  const fmt2 = (n: number) => n.toString().padStart(2, "0");
  const sunriseStr = `${fmt2(sunriseH)}:${fmt2(sunriseM)}`;
  const sunsetStr = `${fmt2(sunsetH)}:${fmt2(sunsetM)}`;
  const isDay = totalMinutesNow >= sunriseTotal && totalMinutesNow < sunsetTotal;
  
  const countdownLabel = isDay
    ? minutesToSunset > 0
      ? `${Math.floor(minutesToSunset / 60)}h ${minutesToSunset % 60}m to Sunset`
      : "Sunset Now"
    : minutesToSunrise > 0 
      ? `${Math.floor(minutesToSunrise / 60)}h ${minutesToSunrise % 60}m to Sunrise`
      : "Sunrise Now";

  // Day progress for the arc visualization (0 to 1 during day, clamped at night)
  const dayLength = sunsetTotal - sunriseTotal;
  const dayProgress = isDay ? (totalMinutesNow - sunriseTotal) / dayLength : (totalMinutesNow > sunsetTotal ? 1 : 0);

  // Generate stars for night mode
  const stars = useMemo(() => {
    const r = mulberry32(1234);
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 20 + r() * 240,
      y: 10 + r() * 60,
      size: 0.5 + r() * 1.5,
      opacity: 0.2 + r() * 0.8,
      duration: 2 + r() * 3,
    }));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass rounded-[32px] p-6 flex flex-col"
      style={{
        boxShadow: isDay ? "0 8px 32px rgba(0,0,0,0.5)" : "0 0 40px rgba(0,212,255,0.05), 0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#e8e8f0]">
          Solar Weather
        </h3>
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: isDay ? "rgba(245,158,11,0.1)" : "rgba(168,85,247,0.1)",
            border: `1px solid ${isDay ? "rgba(245,158,11,0.2)" : "rgba(168,85,247,0.2)"}`,
          }}
        >
          {isDay ? (
            <Sun className="h-4 w-4 text-[#f59e0b]" />
          ) : (
            <Moon className="h-4 w-4 text-[#a855f7]" />
          )}
          <span 
            className="text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ color: isDay ? "#f59e0b" : "#a855f7" }}
          >
            {isDay ? "DAYLIGHT" : "NIGHTTIME"}
          </span>
        </div>
      </div>

      {/* Sun/Moon arc visualization */}
      <div className="relative h-28 mb-6 mt-2">
        <svg viewBox="0 0 280 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="sky-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="night-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.05" />
            </linearGradient>
            <filter id="sun-glow">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="moon-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Stars (Night only) */}
          {!isDay && stars.map(s => (
            <circle key={s.id} cx={s.x} cy={s.y} r={s.size} fill="#e8e8f0" opacity={s.opacity}>
              <animate attributeName="opacity" values={`${s.opacity};0.1;${s.opacity}`} dur={`${s.duration}s`} repeatCount="indefinite" />
            </circle>
          ))}

          {/* Sun/Moon path arc */}
          <path
            d="M 10,90 Q 140,10 270,90"
            fill="none"
            stroke={isDay ? "rgba(245,158,11,0.15)" : "rgba(168,85,247,0.15)"}
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />

          {/* Sun position */}
          {isDay && (
            <g filter="url(#sun-glow)">
              <circle
                r="12"
                cx={10 + dayProgress * 260}
                cy={90 - Math.sin(dayProgress * Math.PI) * 80}
                fill="#f59e0b"
                opacity={0.9}
              >
                <animate attributeName="r" values="12;13.5;12" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle
                r="22"
                cx={10 + dayProgress * 260}
                cy={90 - Math.sin(dayProgress * Math.PI) * 80}
                fill="#f59e0b"
                opacity="0.2"
              />
              <circle
                r="35"
                cx={10 + dayProgress * 260}
                cy={90 - Math.sin(dayProgress * Math.PI) * 80}
                fill="#f59e0b"
                opacity="0.08"
              />
            </g>
          )}

          {/* Moon Position (simplified tracking for night) */}
          {!isDay && (
             <g filter="url(#moon-glow)">
               {/* Moon sits at center at midnight for visual effect, otherwise tracks roughly */}
               <circle
                 r="10"
                 cx={140}
                 cy={30}
                 fill="#e8e8f0"
                 opacity={0.8}
               />
               <circle
                 r="18"
                 cx={140}
                 cy={30}
                 fill="#a855f7"
                 opacity="0.2"
               />
               <circle
                 r="30"
                 cx={140}
                 cy={30}
                 fill="#00d4ff"
                 opacity="0.05"
               />
             </g>
          )}

          {/* Sky glow fill */}
          <path d={`M 10,90 Q 140,10 270,90 L 270,100 L 10,100 Z`} fill={isDay ? "url(#sky-grad)" : "url(#night-grad)"} />
          
          {/* Horizon Line */}
          <line x1="0" y1="90" x2="280" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </svg>
      </div>

      {/* Info rows */}
      <div className="grid grid-cols-3 gap-3 flex-1">
        <div
          className="rounded-[20px] p-4 flex flex-col items-center justify-center transition-all duration-300 hover:bg-white/[0.05]"
          style={{
            backgroundColor: "rgba(0,212,255,0.05)",
            border: "1px solid rgba(0,212,255,0.15)",
          }}
        >
          <div className="flex flex-col items-center gap-1.5 mb-2">
            <Sunrise className="h-5 w-5 text-[#00d4ff]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#6b6b80]">
              Rise
            </span>
          </div>
          <span className="text-base font-black tabular-nums text-[#00d4ff]" style={{ textShadow: "0 0 15px rgba(0,212,255,0.3)" }}>{sunriseStr}</span>
        </div>
        <div
          className="rounded-[20px] p-4 flex flex-col items-center justify-center transition-all duration-300 hover:bg-white/[0.05]"
          style={{
            backgroundColor: "rgba(245,158,11,0.05)",
            border: "1px solid rgba(245,158,11,0.15)",
          }}
        >
          <div className="flex flex-col items-center gap-1.5 mb-2">
            <Zap className="h-5 w-5 text-[#f59e0b]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#6b6b80]">
              Peak
            </span>
          </div>
          <span className="text-base font-black tabular-nums text-[#f59e0b]" style={{ textShadow: "0 0 15px rgba(245,158,11,0.3)" }}>{peakW}W</span>
        </div>
        <div
          className="rounded-[20px] p-4 flex flex-col items-center justify-center transition-all duration-300 hover:bg-white/[0.05]"
          style={{
            backgroundColor: "rgba(255,59,92,0.05)",
            border: "1px solid rgba(255,59,92,0.15)",
          }}
        >
          <div className="flex flex-col items-center gap-1.5 mb-2">
            <Sunset className="h-5 w-5 text-[#ff3b5c]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#6b6b80]">
              Set
            </span>
          </div>
          <span className="text-base font-black tabular-nums text-[#ff3b5c]" style={{ textShadow: "0 0 15px rgba(255,59,92,0.3)" }}>{sunsetStr}</span>
        </div>
      </div>

      {/* Countdown */}
      <AnimatePresence mode="wait">
        <motion.div
          key={countdownLabel}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="mt-5 text-center flex items-center justify-center gap-2"
        >
          {isDay ? <Sun className="h-3.5 w-3.5 text-[#f59e0b]" /> : <Stars className="h-3.5 w-3.5 text-[#00d4ff]" />}
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: isDay ? "#f59e0b" : "#00d4ff" }}>
            {countdownLabel}
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
