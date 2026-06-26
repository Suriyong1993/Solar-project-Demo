import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, Sun, Zap, Activity, ChevronRight } from "lucide-react";

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

// Typewriter effect component
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    setDisplayText("");
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText((prev) => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 20); // typing speed
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [text, delay]);

  return <span>{displayText}</span>;
}

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
          icon: <Zap className="h-4 w-4" />,
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
        icon: <Sun className="h-4 w-4" />,
        title: "Production Analysis",
        description: `Today's generation is ${Math.abs(diff).toFixed(0)}% ${direction} your 30-day avg. of ${avgProduction.toFixed(1)} kWh.`,
        color: "#f59e0b",
      });
    }

    // Best time to run appliances
    if (currentHour < 11) {
      list.push({
        id: "best-time",
        icon: <Clock className="h-4 w-4" />,
        title: "Optimal Window",
        description: `Best time for high-consumption appliances: 11:00–16:00 (peak solar generation expected).`,
        color: "#00d4ff",
      });
    } else if (currentHour >= 11 && currentHour <= 16 && isCharging) {
      list.push({
        id: "optimal-now",
        icon: <Zap className="h-4 w-4" />,
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
      icon: <Activity className="h-4 w-4" />,
      title: "System Health",
      description: `Overall status: ${healthLabel} (${healthScore}%). ${batteryPct > 80 ? "Battery reserves optimal." : "Manage peak usage."}`,
      color: "#a855f7",
    });

    // Runtime prediction
    if (!isCharging && runtimeHours < 12) {
      list.push({
        id: "runtime",
        icon: <Clock className="h-4 w-4" />,
        title: "Runtime Alert",
        description: `Backup lasts approx. ${runtimeHours.toFixed(1)} hrs. Minimum load recommended.`,
        color: "#ff3b5c",
      });
    }

    return list;
  }, [solarKw, batteryPct, loadKw, isCharging, todayKwh, runtimeHours, currentHour]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="glass rounded-[32px] p-6 relative overflow-hidden"
    >
      {/* Decorative background flare */}
      <div 
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}
      />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative grid h-8 w-8 place-items-center rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20">
            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#a855f7]" />
            <Sparkles className="h-4 w-4 text-[#a855f7]" />
          </div>
          <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#e8e8f0]">
            AI Intelligence
          </h3>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f593] animate-pulse" />
          <span className="text-[8px] font-bold uppercase tracking-wider text-[#6b6b80]">Active</span>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <AnimatePresence mode="popLayout">
          {insights.map((insight, i) => (
            <motion.div
              key={insight.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: i * 0.15, type: "spring", stiffness: 100 }}
              className="group relative rounded-[20px] p-4 overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{
                backgroundColor: "rgba(255,255,255,0.02)",
                border: `1px solid rgba(255,255,255,0.05)`,
                borderLeft: `3px solid ${insight.color}`,
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, ${insight.color}15 0%, transparent 100%)`,
                }}
              />

              <div className="relative flex items-start gap-3.5">
                <div
                  className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                  style={{
                    backgroundColor: `${insight.color}15`,
                    color: insight.color,
                    boxShadow: `0 0 15px ${insight.color}20`,
                  }}
                >
                  {insight.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className="text-[11px] font-bold uppercase tracking-[0.12em]"
                      style={{ color: insight.color }}
                    >
                      {insight.title}
                    </div>
                    <ChevronRight className="h-3 w-3 text-[#6b6b80] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0" />
                  </div>
                  <p className="text-[13px] leading-relaxed text-[#a0a0b8] font-medium">
                     <TypewriterText text={insight.description} delay={i * 0.15 + 0.3} />
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
