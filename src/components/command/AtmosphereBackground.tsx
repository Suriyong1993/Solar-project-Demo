import { useMemo } from "react";

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function AtmosphereBackground() {
  const dots = useMemo(() => {
    const r = mulberry32(4242);
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: +(r() * 100).toFixed(2),
      y: +(r() * 100).toFixed(2),
      size: +(r() * 1.5 + 0.5).toFixed(2),
      opacity: +(r() * 0.25 + 0.05).toFixed(3),
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base bg — deep space blue per Solar-X spec */}
      <div className="absolute inset-0 bg-[#050816]" />

      {/* Subtle radial glow — warm center */}
      <div
        className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[1000px] rounded-full opacity-[0.07] blur-[180px]"
        style={{ background: "radial-gradient(circle, #d4a032 0%, transparent 70%)" }}
      />

      {/* Cool top accent */}
      <div
        className="absolute -right-32 -top-32 h-[500px] w-[600px] rounded-full opacity-[0.05] blur-[150px]"
        style={{ background: "radial-gradient(circle, #2dd4bf 0%, transparent 70%)" }}
      />

      {/* Dot grid */}
      <svg className="absolute inset-0 h-full w-full">
        {dots.map((d) => (
          <circle
            key={d.id}
            cx={`${d.x}%`}
            cy={`${d.y}%`}
            r={d.size}
            fill="#d4a032"
            opacity={d.opacity}
          />
        ))}
      </svg>

      {/* Subtle horizontal grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "100% 60px",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, rgba(5,8,22,0.6) 100%)",
        }}
      />
    </div>
  );
}
