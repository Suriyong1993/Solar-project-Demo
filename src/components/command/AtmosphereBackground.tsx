import { useMemo } from "react";

function getSunPosition(hour: number) {
  const angle = ((hour - 6) / 12) * Math.PI;
  const normalized = Math.cos(angle);
  const isDay = normalized > 0;
  const intensity = Math.max(0, normalized);
  let r: number, g: number, b: number;
  if (hour >= 5 && hour < 8) {
    const t = (hour - 5) / 3;
    r = 0.8 + t * 0.2; g = 0.3 + t * 0.5; b = 0.1 + t * 0.3;
  } else if (hour >= 8 && hour < 16) {
    const t = (hour - 8) / 8;
    r = 0.9 - t * 0.1; g = 0.8 + t * 0.1; b = 0.4 + t * 0.4;
  } else if (hour >= 16 && hour < 19) {
    const t = (hour - 16) / 3;
    r = 0.8 + t * 0.2; g = 0.9 - t * 0.5; b = 0.8 - t * 0.6;
  } else {
    r = 0.05; g = 0.02; b = 0.1;
  }
  return { angle, isDay, intensity, r, g, b };
}

export function AtmosphereBackground() {
  const hour = new Date().getHours() + new Date().getMinutes() / 60;
  const sun = useMemo(() => getSunPosition(hour), [hour]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundColor: "#0a0c12" }} />
      <div
        className="absolute inset-0 transition-all duration-[3000ms]"
        style={{
          background: sun.isDay
            ? `radial-gradient(ellipse 140% 100% at 50% 0%, rgba(${Math.round(sun.r*255)},${Math.round(sun.g*255)},${Math.round(sun.b*255)},${sun.intensity*0.10}) 0%, transparent 70%)`
            : `radial-gradient(ellipse 100% 60% at 50% 100%, rgba(20,10,50,0.35) 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute -right-64 -top-64 h-[700px] w-[700px] rounded-full opacity-[0.04] blur-[160px]"
        style={{
          background: `radial-gradient(circle, ${sun.isDay ? "rgba(246,181,74,0.3)" : "rgba(129,140,248,0.25)"} 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute -bottom-64 -left-64 h-[600px] w-[600px] rounded-full opacity-[0.03] blur-[140px]"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.2) 0%, transparent 70%)" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 55% at 50% 45%, transparent 40%, rgba(10,12,18,0.7) 100%)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)",
          backgroundSize: "100% 64px",
        }}
      />
    </div>
  );
}
