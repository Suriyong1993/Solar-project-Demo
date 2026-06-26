import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, Sun, Zap, Activity } from "lucide-react";

interface AIInsightsProps {
  solarKw: number;
  batteryPct: number;
  loadKw: number;
  isCharging: boolean;
  todayKwh: number;
  runtimeHours: number;
  currentHour: number;
}

type Insight = {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
};

export function AIInsights({
  solarKw,
  batteryPct,
  loadKw,
  isCharging,
  todayKwh,
  runtimeHours,
  currentHour,
}: AIInsightsProps) {
  const insights: Insight[] = useMemo(() => {
    const list: Insight[] = [];

    // Battery prediction
    if (isCharging && batteryPct < 95) {
      const ratePerMinute = solarKw > 0 ? (solarKw - loadKw) / 5 : 0.3;
      const minsToFull =
        ratePerMinute > 0 ? Math.round(((((100 - batteryPct) / 100) * 5) / ratePerMinute) * 60) : 0;
      if (minsToFull > 0 && minsToFull < 300) {
        list.push({
          id: "battery-full",
          icon: <Zap className="h-3.5 w-3.5" />,
          title: "Battery Forecast",
          description: `Battery will reach 100% in approximately ${minsToFull} minutes at current solar yield.`,
          color: "#00f593",
        });
      }
    }

    // Today's production comparison
    if (todayKwh > 0) {
      const avgProduction = 18.5;
      const diff = ((todayKwh - avgProduction) / avgProduction) * 100;
      const direction = diff >= 0 ? "above" : "below";
      list.push({
        id: "production",
        icon: <Sun className="h-3.5 w-3.5" />,
        title: "Production Analysis",
        description: `Today's generation is ${Math.abs(diff).toFixed(0)}% ${direction} your 30-day average of ${avgProduction.toFixed(1)} kWh.`,
        color: "#f59e0b",
      });
    }

    // Best time to run appliances
    const peakSolarHours = [11, 12, 13, 14, 15, 16];
    if (currentHour < 11) {
      list.push({
        id: "best-time",
        icon: <Clock className="h-3.5 w-3.5" />,
        title: "Optimal Window",
        description: `Best time to run high-consumption appliances: 11:00–16:00 (peak solar generation).`,
        color: "#00d4ff",
      });
    } else if (currentHour >= 11 && currentHour <= 16 && isCharging) {
      list.push({
        id: "optimal-now",
        icon: <Zap className="h-3.5 w-3.5" />,
        title: "Peak Generation",
        description: `Solar output is at ${solarKw.toFixed(1)} kW. Ideal time to run energy-intensive appliances.`,
        color: "#f59e0b",
      });
    }

    // System health
    const healthScore = Math.min(
      100,
      Math.round(85 + (isCharging ? 10 : 0) + (loadKw < 1.5 ? 5 : 0)),
    );
    const healthLabel = healthScore >= 90 ? "Excellent" : healthScore >= 75 ? "Good" : "Fair";
    list.push({
      id: "health",
      icon: <Activity className="h-3.5 w-3.5" />,
      title: "System Health",
      description: `Overall system status: ${healthLabel} (${healthScore}%). ${batteryPct > 80 ? "Battery reserves are optimal." : "Consider reducing consumption during peak evening hours."}`,
      color: "#a855f7",
    });

    // Runtime prediction
    if (!isCharging && runtimeHours < 12) {
      list.push({
        id: "runtime",
        icon: <Clock className="h-3.5 w-3.5" />,
        title: "Runtime Alert",
        description: `At current discharge rate, battery backup lasts approximately ${runtimeHours.toFixed(1)} hours. Minimum load recommended.`,
        color: "#ff3b5c",
      });
    }

    return list;
  }, [solarKw, batteryPct, loadKw, isCharging, todayKwh, runtimeHours, currentHour]);

  return (
    <div className="glass rounded-[32px] p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/15">
          <Sparkles className="h-3 w-3 text-[#a855f7]" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#a855f7]">
            AI Intelligence
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {insights.map((insight, i) => (
            <motion.div
              key={insight.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group relative rounded-[20px] p-3.5 overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: `${insight.color}08`,
                border: `1px solid ${insight.color}15`,
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(200px at 80% 50%, ${insight.color}10, transparent)`,
                }}
              />

              <div className="relative flex items-start gap-3">
                <div
                  className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full"
                  style={{
                    backgroundColor: `${insight.color}15`,
                    color: insight.color,
                  }}
                >
                  {insight.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-0.5"
                    style={{ color: insight.color }}
                  >
                    {insight.title}
                  </div>
                  <p className="text-[12px] leading-relaxed text-[#9b9bb0]">
                    {insight.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
