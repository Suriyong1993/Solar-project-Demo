import { motion } from "framer-motion";
import { Sunrise, Sunset, Zap, Cloud, Sun, Moon } from "lucide-react";
import { useMemo } from "react";

type WeatherWidgetProps = { peakKw: number };

function calcSunTimes() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const lat = (13.7 * Math.PI) / 180;
  const decl = ((23.45 * Math.PI) / 180) * Math.sin(((2 * Math.PI) / 365) * (284 + dayOfYear));
  const cosHa = -Math.tan(lat) * Math.tan(decl);
  const ha = Math.acos(Math.max(-1, Math.min(1, cosHa)));
  const haHours = (ha * (180 / Math.PI)) / 15;
  const noon = 12 - 100.5 / 15 + 7;
  const sunrise = noon - haHours;
  const sunset = noon + haHours;
  return { sunriseH: Math.floor(sunrise), sunriseM: Math.floor((sunrise % 1) * 60), sunsetH: Math.floor(sunset), sunsetM: Math.floor((sunset % 1) * 60) };
}

export function WeatherWidget({ peakKw }: WeatherWidgetProps) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const { sunriseH, sunriseM, sunsetH, sunsetM } = useMemo(() => calcSunTimes(), []);
  const totalMinutes = currentHour * 60 + currentMin;
  const sunsetTotal = sunsetH * 60 + sunsetM;
  const sunriseTotal = sunriseH * 60 + sunriseM;
  const isDay = totalMinutes >= sunriseTotal && totalMinutes < sunsetTotal;
  const dayLength = sunsetTotal - sunriseTotal;
  const dayProgress = isDay ? (totalMinutes - sunriseTotal) / dayLength : (totalMinutes > sunsetTotal ? 1 : 0);
  const fmt2 = (n: number) => n.toString().padStart(2, "0");
  const peakW = Math.round(peakKw * 1000);
  const countdown = isDay
    ? `${Math.floor(Math.max(0, sunsetTotal - totalMinutes) / 60)}h ${Math.max(0, sunsetTotal - totalMinutes) % 60}m to sunset`
    : `${Math.floor(Math.max(0, (totalMinutes > sunsetTotal ? 1440 - totalMinutes + sunriseTotal : sunriseTotal - totalMinutes)) / 60)}h ${Math.max(0, (totalMinutes > sunsetTotal ? 1440 - totalMinutes + sunriseTotal : sunriseTotal - totalMinutes)) % 60}m to sunrise`;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="glass rounded-3xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="label-xs">Solar Weather</h3>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--muted)] border border-[var(--border-default)]">
          {isDay ? <Sun className="h-4 w-4 text-[var(--energy-solar)]" /> : <Moon className="h-4 w-4 text-[var(--accent)]" />}
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: isDay ? "var(--energy-solar)" : "var(--accent)" }}>{isDay ? "DAYLIGHT" : "NIGHTTIME"}</span>
        </div>
      </div>

      <div className="relative h-28 mb-6 mt-2">
        <svg viewBox="0 0 280 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="sky-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--energy-solar)" stopOpacity="0.15" />
              <stop offset="50%" stopColor="var(--energy-solar)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--energy-solar)" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="night-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--status-info)" stopOpacity="0.05" />
              <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--status-info)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d="M 10,90 Q 140,10 270,90" fill="none" stroke={isDay ? "color-mix(in srgb, var(--energy-solar) 15%, transparent)" : "color-mix(in srgb, var(--accent) 15%, transparent)"} strokeWidth="1.5" strokeDasharray="4 6" />
          {isDay && (
            <g>
              <circle r="12" cx={10 + dayProgress * 260} cy={90 - Math.sin(dayProgress * Math.PI) * 80} fill="var(--energy-solar)" opacity={0.9} />
              <circle r="22" cx={10 + dayProgress * 260} cy={90 - Math.sin(dayProgress * Math.PI) * 80} fill="var(--energy-solar)" opacity="0.2" />
            </g>
          )}
          {!isDay && (
            <g>
              <circle r="10" cx={140} cy={30} fill="var(--text-primary)" opacity={0.8} />
              <circle r="18" cx={140} cy={30} fill="var(--accent)" opacity="0.2" />
            </g>
          )}
          <path d={`M 10,90 Q 140,10 270,90 L 270,100 L 10,100 Z`} fill={isDay ? "url(#sky-grad)" : "url(#night-grad)"} />
          <line x1="0" y1="90" x2="280" y2="90" stroke="var(--border-default)" strokeWidth="1" />
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-3 flex-1">
        <div className="rounded-2xl p-4 flex flex-col items-center justify-center bg-[var(--status-info)]/5 border border-[var(--status-info)]/15">
          <Sunrise className="h-5 w-5 mb-1.5" style={{ color: "var(--status-info)" }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1">Rise</span>
          <span className="text-base font-black tabular-nums" style={{ color: "var(--status-info)" }}>{fmt2(sunriseH)}:{fmt2(sunriseM)}</span>
        </div>
        <div className="rounded-2xl p-4 flex flex-col items-center justify-center bg-[var(--energy-solar)]/5 border border-[var(--energy-solar)]/15">
          <Zap className="h-5 w-5 mb-1.5" style={{ color: "var(--energy-solar)" }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1">Peak</span>
          <span className="text-base font-black tabular-nums" style={{ color: "var(--energy-solar)" }}>{peakW}W</span>
        </div>
        <div className="rounded-2xl p-4 flex flex-col items-center justify-center bg-[var(--status-error)]/5 border border-[var(--status-error)]/15">
          <Sunset className="h-5 w-5 mb-1.5" style={{ color: "var(--status-error)" }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1">Set</span>
          <span className="text-base font-black tabular-nums" style={{ color: "var(--status-error)" }}>{fmt2(sunsetH)}:{fmt2(sunsetM)}</span>
        </div>
      </div>
      <div className="mt-4 text-center text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">{countdown}</div>
    </motion.div>
  );
}
