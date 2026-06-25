import { motion } from "framer-motion";
import { Battery, Sun, Sunset, Zap } from "lucide-react";

type Accent = "amber" | "teal" | "warm" | "cool";

const accentMap: Record<Accent, { color: string }> = {
  amber: { color: "#d4a032" },
  teal: { color: "#2dd4bf" },
  warm: { color: "#e8a84a" },
  cool: { color: "#60a5fa" },
};

type Item = {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  sublabel: string;
  trend: string;
  spark: number[];
  accent: Accent;
};

export type InsightsData = {
  todayKwh: number;
  runtimeHours: number;
  peakKw: number;
  batteryPct: number;
  isCharging: boolean;
  currentHour: number;
  series?: { t: number; solar: number; load: number; battery: number }[];
};

function buildInsightItems(data: InsightsData): Item[] {
  const s = data.series ?? [];

  const sparkSolar = s.length > 4
    ? s.map((p) => Math.round(p.solar * 1000))
    : (() => {
        const pts: number[] = [];
        for (let i = 0; i < 15; i++) {
          const h = (i / 14) * 12;
          const sunFactor = Math.max(0, Math.sin(((h - 1) / 10) * Math.PI));
          pts.push(Math.round(sunFactor * data.peakKw * 1000));
        }
        return pts;
      })();

  const sparkBattery = s.length > 4
    ? s.map((p) => Math.round(p.battery * 10) / 10)
    : (() => {
        const pts: number[] = [];
        for (let i = 0; i < 15; i++) {
          const drain = (i / 14) * 25;
          pts.push(Math.round((data.batteryPct - drain) * 10) / 10);
        }
        return pts;
      })();

  const sparkLoad = s.length > 4
    ? s.map((p) => Math.round(p.load * 100) / 100)
    : sparkSolar.map((v) => Math.max(0.3, v * 0.4 + 0.5));

  const setHour = 18;
  const setMin = 42;
  const sunsetIn = setHour - data.currentHour;
  const sunsetLabel = sunsetIn > 0
    ? `In ${sunsetIn}h ${setMin}m`
    : sunsetIn === 0
    ? "Within the hour"
    : "Passed";

  const peakW = Math.round(data.peakKw * 1000);
  const todayKwhStr = data.todayKwh.toFixed(1);
  const runtimeStr = data.runtimeHours > 24 ? "24+" : data.runtimeHours.toFixed(0);
  const runtimePct = `${data.batteryPct.toFixed(0)}%`;

  return [
    {
      icon: <Sun className="h-3 w-3" strokeWidth={2.5} />,
      label: "TODAY",
      value: todayKwhStr,
      unit: "kWh",
      sublabel: "Generated",
      trend: data.isCharging ? "CHARGING" : "STANDBY",
      spark: sparkSolar,
      accent: "amber",
    },
    {
      icon: <Battery className="h-3 w-3" strokeWidth={2.5} />,
      label: "RUNTIME",
      value: runtimeStr,
      unit: "h",
      sublabel: data.isCharging ? "Charging" : "Until 20% SOC",
      trend: runtimePct,
      spark: sparkBattery,
      accent: "teal",
    },
    {
      icon: <Zap className="h-3 w-3" strokeWidth={2.5} />,
      label: "PEAK",
      value: `${peakW}`,
      unit: "W",
      sublabel: `Peak today`,
      trend: data.isCharging ? "CHARGING" : "CLEAR",
      spark: sparkLoad,
      accent: "cool",
    },
    {
      icon: <Sunset className="h-3 w-3" strokeWidth={2.5} />,
      label: "SUNSET",
      value: `${setHour}:${setMin.toString().padStart(2, "0")}`,
      sublabel: sunsetLabel,
      trend: "AUTO-DIM",
      spark: sparkSolar.slice().reverse(),
      accent: "warm",
    },
  ];
}

export function InsightsStrip({ data }: { data: InsightsData }) {
  const items = buildInsightItems(data);

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06, delayChildren: 0.03 } },
      }}
      className="grid grid-cols-2 gap-3 md:grid-cols-4"
    >
      {items.map((item, i) => (
        <InsightCard key={item.label} {...item} index={i} />
      ))}
    </motion.div>
  );
}

function InsightCard({ icon, label, value, unit, sublabel, trend, spark, accent, index }: Item & { index: number }) {
  const a = accentMap[accent];
  const max = Math.max(...spark);
  const min = Math.min(...spark);
  const range = max - min || 1;
  const pts = spark.map((v, i) => {
    const x = (i / (spark.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const linePath = `M ${pts.join(" L ")}`;
  const areaPath = `M 0,100 L ${pts.join(" L ")} L 100,100 Z`;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="panel relative overflow-hidden rounded-lg p-4"
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="grid h-6 w-6 place-items-center rounded"
            style={{
              background: `${a.color}10`,
              border: `1px solid ${a.color}20`,
              color: a.color,
            }}
          >
            {icon}
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}>
            {label}
          </span>
        </div>
        <span className="flex items-center gap-1 rounded border border-white/[0.04] bg-white/[0.02] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider" style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}>
          <span className="h-1 w-1 rounded-full" style={{ background: a.color }} />
          {trend}
        </span>
      </div>

      {/* Value */}
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-[1.75rem] font-bold tabular-nums leading-none" style={{ color: a.color, fontFamily: "JetBrains Mono", letterSpacing: "-0.02em" }}>
          {value}
        </span>
        {unit && (
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}>
            {unit}
          </span>
        )}
      </div>

      {/* Sublabel */}
      <div className="mt-0.5 text-[9px] font-medium uppercase tracking-wider" style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}>
        {sublabel}
      </div>

      {/* Sparkline */}
      <div className="mt-2 h-6 w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id={`spark-${accent}-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={a.color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={a.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <motion.path
            d={areaPath}
            fill={`url(#spark-${accent}-${index})`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + index * 0.06, duration: 0.5 }}
          />
          <motion.path
            d={linePath}
            fill="none"
            stroke={a.color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.8 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + index * 0.06, duration: 1, ease: "easeOut" }}
          />
        </svg>
      </div>
    </motion.div>
  );
}
