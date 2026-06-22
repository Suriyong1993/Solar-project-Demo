import { useMemo } from "react";

export function AtmosphereBackground() {
  const stars = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 70,
        size: Math.random() * 1.6 + 0.4,
        delay: Math.random() * 4,
        dur: 2.5 + Math.random() * 3,
      })),
    []
  );
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 8,
        dur: 12 + Math.random() * 14,
        color: Math.random() > 0.5 ? "rgba(250,204,21,0.5)" : "rgba(56,189,248,0.55)",
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 20% 0%, rgba(250,204,21,0.10), transparent 55%), radial-gradient(ellipse 70% 55% at 90% 25%, rgba(56,189,248,0.12), transparent 60%), radial-gradient(ellipse 80% 60% at 50% 110%, rgba(139,92,246,0.10), transparent 60%), linear-gradient(180deg,#020617 0%,#07111f 55%,#0f172a 100%)",
        }}
      />
      {/* starfield */}
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
      {/* drifting gold blob */}
      <div
        className="absolute -left-32 top-20 h-[480px] w-[480px] rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, #facc15 0%, transparent 70%)", animation: "drift 22s ease-in-out infinite" }}
      />
      {/* drifting blue blob */}
      <div
        className="absolute -right-40 top-1/3 h-[560px] w-[560px] rounded-full opacity-40 blur-[140px]"
        style={{ background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)", animation: "drift 28s ease-in-out 4s infinite reverse" }}
      />
      {/* violet floor glow */}
      <div
        className="absolute -bottom-40 left-1/4 h-[520px] w-[640px] rounded-full opacity-30 blur-[140px]"
        style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", animation: "drift 32s ease-in-out 2s infinite" }}
      />
      {/* perspective grid floor */}
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
      {/* particles */}
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
      {/* top vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 100% 60% at 50% 0%, transparent 50%, rgba(2,6,23,0.55) 100%)" }} />
    </div>
  );
}
