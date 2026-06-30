import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, Zap, ChevronRight } from "lucide-react";

interface AIInsightsProps {
  solarKw: number;
  batteryPct: number;
  loadKw: number;
  isCharging: boolean;
  todayKwh: number;
  runtimeHours: number;
  currentHour: number;
}

type Insight = { id: string; icon: React.ReactNode; title: string; description: string; color: string };

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [display, setDisplay] = useState("");
  useEffect(() => {
    setDisplay("");
    let i = 0;
    let iv: ReturnType<typeof setInterval>;
    const to = setTimeout(() => {
      iv = setInterval(() => {
        if (i < text.length) { setDisplay(p => p + text.charAt(i)); i++; } else clearInterval(iv);
      }, 20);
    }, delay * 1000);
    return () => { clearTimeout(to); clearInterval(iv); };
  }, [text, delay]);
  return <span>{display}</span>;
}

export function AIInsights({ solarKw, batteryPct, loadKw, isCharging, runtimeHours, currentHour }: AIInsightsProps) {
  const insights: Insight[] = useMemo(() => {
    const list: Insight[] = [];
    if (isCharging && batteryPct < 95) {
      const rate = solarKw > 0 ? (solarKw - loadKw) / 5 : 0.3;
      const mins = rate > 0 ? Math.round(((((100 - batteryPct) / 100) * 5) / rate) * 60) : 0;
      if (mins > 0 && mins < 300) list.push({ id: "battery-full", icon: <Zap className="h-4 w-4" />, title: "Battery Forecast", description: `Battery will reach 100% in approximately ${mins} minutes at current solar yield.`, color: "var(--status-online)" });
    }
    if (currentHour < 11) list.push({ id: "best-time", icon: <Clock className="h-4 w-4" />, title: "Optimal Window", description: "Best time for high-consumption appliances: 11:00–16:00 (peak solar generation expected).", color: "var(--status-info)" });
    else if (currentHour >= 11 && currentHour <= 16 && isCharging) list.push({ id: "optimal-now", icon: <Zap className="h-4 w-4" />, title: "Peak Generation", description: `Solar output is at ${solarKw.toFixed(1)} kW. Ideal time to run energy-intensive appliances.`, color: "var(--energy-solar)" });
    if (!isCharging && runtimeHours < 12) list.push({ id: "runtime", icon: <Clock className="h-4 w-4" />, title: "Runtime Alert", description: `Backup lasts approx. ${runtimeHours.toFixed(1)} hrs. Minimum load recommended.`, color: "var(--status-error)" });
    return list;
  }, [solarKw, batteryPct, loadKw, isCharging, currentHour, runtimeHours]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="glass rounded-3xl p-6 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-20 pointer-events-none" style={{ background: "var(--accent)" }} />
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative grid h-8 w-8 place-items-center rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20">
            <Sparkles className="h-4 w-4" style={{ color: "var(--accent)" }} />
          </div>
          <h3 className="label-xs">AI Intelligence</h3>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-[var(--muted)] border border-[var(--border-default)] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-online)] animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Active</span>
        </div>
      </div>
      <div className="space-y-3 relative z-10">
        <AnimatePresence mode="popLayout">
          {insights.map((insight, i) => (
            <motion.div key={insight.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: i * 0.15, type: "spring", stiffness: 100 }}
              className="group relative rounded-xl p-4 overflow-hidden transition-all duration-200 hover:bg-[var(--muted)] cursor-pointer border border-[var(--border-default)]"
              style={{ borderLeft: `3px solid ${insight.color}` }}
            >
              <div className="relative flex items-start gap-3.5">
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: `color-mix(in srgb, ${insight.color} 15%, transparent)`, color: insight.color }}>
                  {insight.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: insight.color }}>{insight.title}</div>
                    <ChevronRight className="h-3 w-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 -translate-x-2 group-hover:translate-x-0" />
                  </div>
                  <p className="text-[13px] leading-relaxed text-[var(--text-secondary)] font-medium"><TypewriterText text={insight.description} delay={i * 0.15 + 0.3} /></p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
