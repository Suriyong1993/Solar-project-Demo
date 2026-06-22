import { useMemo } from "react";

// Deterministic PRNG so SSR and client render the same starfield (no hydration mismatch).
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function AtmosphereBackground() {
  const { stars, particles } = useMemo(() => {
    const r1 = mulberry32(1337);
    const stars = Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: +(r1() * 100).toFixed(3),
      y: +(r1() * 70).toFixed(3),
      size: +(r1() * 1.6 + 0.4).toFixed(3),
      delay: +(r1() * 4).toFixed(3),
      dur: +(2.5 + r1() * 3).toFixed(3),
    }));
    const r2 = mulberry32(99);
    const particles = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: +(r2() * 100).toFixed(3),
      y: +(r2() * 100).toFixed(3),
      delay: +(r2() * 8).toFixed(3),
      dur: +(12 + r2() * 14).toFixed(3),
      color: r2() > 0.5 ? "rgba(250,204,21,0.5)" : "rgba(56,189,248,0.55)",
    }));
    return { stars, particles };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 20% 0%, rgba(250,204,21,0.10), transparent 55%), radial-gradient(ellipse 70% 55% at 90% 25%, rgba(56,189,248,0.12), transparent 60%), radial-gradient(ellipse 80% 60% at 50% 110%, rgba(139,92,246,0.10), transparent 60%), linear-gradient(180deg,#020617 0%,#07111f 55%,#0f172a 100%)",
        }}
      />
      <svg className="absolute inset-0 h-full w-full">
        {stars.map((s) => (
          <circle
            key={s.id}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.size}
            fill="white"
            opacity={0.6}
            style={{ animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }}
          />
        ))}
      </svg>
      <div
        className="absolute -left-32 top-20 h-[480px] w-[480px] rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, #facc15 0%, transparent 70%)", animation: "drift 22s ease-in-out infinite" }}
      />
      <div
        className="absolute -right-40 top-1/3 h-[560px] w-[560px] rounded-full opacity-40 blur-[140px]"
        style={{ background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)", animation: "drift 28s ease-in-out 4s infinite reverse" }}
      />
      <div
        className="absolute -bottom-40 left-1/4 h-[520px] w-[640px] rounded-full opacity-30 blur-[140px]"
        style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", animation: "drift 32s ease-in-out 2s infinite" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[55vh]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(56,189,248,0.06) 60%, rgba(56,189,248,0.10) 100%)",
          maskImage: "linear-gradient(180deg, transparent 0%, black 40%, black 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.18) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            transform: "perspective(700px) rotateX(62deg) translateY(8%)",
            transformOrigin: "bottom",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 100%, black 30%, transparent 80%)",
          }}
        />
      </div>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute h-[3px] w-[3px] rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.color,
            boxShadow: `0 0 8px ${p.color}`,
            animation: `drift ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 100% 60% at 50% 0%, transparent 50%, rgba(2,6,23,0.55) 100%)" }} />
    </div>
  );
}
