import { Battery, Home, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { MetricCard } from "./MetricCard";

interface KpiStripProps {
  batteryPct: number;
  isCharging: boolean;
  loadKw: number;
  batteryNetW: number;
  todayKwh: number;
  efficiencyPct: number;
}

export function KpiStrip({
  batteryPct,
  isCharging,
  loadKw,
  batteryNetW,
  todayKwh,
}: KpiStripProps) {
  const netIcon = isCharging ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricCard
        icon={<Battery className="h-5 w-5" />}
        label="Battery"
        value={batteryPct.toFixed(0)}
        unit="%"
        delta={isCharging ? "CHARGING" : "DRAINING"}
        accent="teal"
        index={0}
      />
      <MetricCard
        icon={<Home className="h-5 w-5" />}
        label="Home Load"
        value={loadKw.toFixed(2)}
        unit="kW"
        delta={loadKw < 1.5 ? "ECO" : "HIGH"}
        accent="cool"
        index={1}
      />
      <MetricCard
        icon={netIcon}
        label="Net Flow"
        value={`${isCharging ? "+" : "-"}${batteryNetW}`}
        unit="W"
        delta={isCharging ? "SURPLUS" : "DEFICIT"}
        accent={isCharging ? "teal" : "warm"}
        index={2}
      />
      <MetricCard
        icon={<Zap className="h-5 w-5" />}
        label="Daily Yield"
        value={todayKwh.toFixed(1)}
        unit="kWh"
        delta="TODAY"
        accent="amber"
        index={3}
      />
    </div>
  );
}
