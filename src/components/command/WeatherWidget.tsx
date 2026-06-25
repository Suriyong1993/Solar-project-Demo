import { motion } from "framer-motion";
import { Sunrise, Sunset, Zap } from "lucide-react";

type WeatherWidgetProps = {
  peakKw: number;
};

export function WeatherWidget({ peakKw }: WeatherWidgetProps) {
  const peakW = Math.round(peakKw * 1000);
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  const sunriseH = 6;
  const sunriseM = 12;
  const sunsetH = 18;
  const sunsetM = 42;

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
      ? `${Math.floor(minutesToSunset / 60)}h ${minutesToSunset % 60}m to sunset`
      : "Sunset now"
    : "Night mode";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="panel relative overflow-hidden rounded-lg p-5"
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#d4a032" }} />
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}>
          CONDITIONS
        </span>
      </div>
      <div className="text-lg font-bold" style={{ color: "#e2e2e8", fontFamily: "Chakra Petch" }}>
        SOLAR FORECAST
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, #d4a032, #2dd4bf, #d4a032)", opacity: 0.4, filter: "blur(4px)" }} />
          <div className="absolute inset-1 rounded-full bg-[#050816]" />
          <Zap className="absolute inset-0 m-auto h-6 w-6" style={{ color: "#d4a032" }} strokeWidth={2} />
        </div>
        <div>
          <div className="text-4xl font-bold" style={{ color: "#d4a032", fontFamily: "JetBrains Mono" }}>
            {peakW}<span className="text-sm" style={{ color: "#6b6b7b" }}>W</span>
          </div>
          <div className="text-[10px] font-semibold" style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}>
            PEAK · {isDay ? "ACTIVE" : "STANDBY"}
          </div>
          <div className="mt-0.5 text-[9px] uppercase tracking-wider" style={{ color: "#d4a032", fontFamily: "JetBrains Mono" }}>
            {countdownLabel}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-1.5">
        <Row label="SUNRISE" value={sunriseStr} color="#2dd4bf" icon={<Sunrise className="h-3 w-3" />} />
        <Row label="PEAK" value="12:00–15:00" color="#d4a032" />
        <Row label="SUNSET" value={sunsetStr} color="#dc4446" icon={<Sunset className="h-3 w-3" />} />
      </div>
    </motion.div>
  );
}

function Row({ label, value, color, icon }: { label: string; value: string; color: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-white/[0.04] bg-white/[0.01] px-3 py-2">
      <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}>
        {icon}{label}
      </div>
      <div className="text-sm font-bold tabular-nums" style={{ color, fontFamily: "JetBrains Mono" }}>{value}</div>
    </div>
  );
}
