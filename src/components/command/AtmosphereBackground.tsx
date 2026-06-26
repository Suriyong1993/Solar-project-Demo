import { useMemo, useEffect, useState } from "react";

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getSunPosition(hour: number) {
  // Returns sun angle and color based on time of day
  const angle = ((hour - 6) / 12) * Math.PI;
  const normalized = Math.cos(angle);
  const isDay = normalized > 0;
  const intensity = Math.max(0, normalized);

  // Sunrise: warm orange, Noon: white-blue, Sunset: orange-red, Night: dark blue
  let r: number, g: number, b: number;
  if (hour >= 5 && hour < 8) {
    // Sunrise
    const t = (hour - 5) / 3;
    r = 0.8 + t * 0.2;
    g = 0.3 + t * 0.5;
    b = 0.1 + t * 0.3;
  } else if (hour >= 8 && hour < 16) {
    // Day
    const t = (hour - 8) / 8;
    r = 0.9 - t * 0.1;
    g = 0.8 + t * 0.1;
    b = 0.4 + t * 0.4;
  } else if (hour >= 16 && hour < 19) {
    // Sunset
    const t = (hour - 16) / 3;
    r = 0.8 + t * 0.2;
    g = 0.9 - t * 0.5;
    b = 0.8 - t * 0.6;
  } else {
    // Night
    r = 0.05;
    g = 0.02;
    b = 0.1;
  }

  return { angle, isDay, intensity, r, g, b };
}

export function AtmosphereBackground() {
  const [hour, setHour] = useState(() => new Date().getHours() + new Date().getMinutes() / 60);

  useEffect(() => {
    const id = setInterval(() => {
      setHour(new Date().getHours() + new Date().getMinutes() / 60);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const sun = useMemo(() => getSunPosition(hour), [hour]);
  const dots = useMemo(() => {
    const r = mulberry32(4242);
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: +(r() * 100).toFixed(2),
      y: +(r() * 100).toFixed(2),
      size: +(r() * 1.8 + 0.3).toFixed(2),
      opacity: +(r() * 0.3 + 0.03).toFixed(3),
      twinkle: +(r() * 3 + 1).toFixed(1),
      delay: +(r() * 5).toFixed(1),
    }));
  }, []);

  const stars = useMemo(() => {
    const r = mulberry32(9999);
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: +(r() * 100).toFixed(2),
      y: +(r() * 100).toFixed(2),
      size: +(r() * 1.2 + 0.2).toFixed(2),
      opacity: +(r() * 0.5 + 0.1).toFixed(3),
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base bg — deep matte black */}
      <div className="absolute inset-0" style={{ backgroundColor: "#07090f" }} />

      {/* Dynamic sky gradient based on time */}
      <div
        className="absolute inset-0 transition-all duration-[2000ms]"
        style={{
          background: sun.isDay
            ? `radial-gradient(ellipse 120% 80% at 50% 0%, 
                rgba(${sun.r * 255},${sun.g * 255},${sun.b * 255},${sun.intensity * 0.12}) 0%, 
                transparent 70%)`
            : `radial-gradient(ellipse 100% 60% at 50% 100%, 
                rgba(10,5,30,0.3) 0%, 
                transparent 70%)`,
        }}
      />

      {/* Sun glow */}
      {sun.isDay && (
        <div
          className="absolute transition-all duration-[3000ms]"
          style={{
            left: `${20 + sun.intensity * 60}%`,
            top: `${80 - sun.intensity * 60}%`,
            width: `${200 + sun.intensity * 200}px`,
            height: `${200 + sun.intensity * 200}px`,
            borderRadius: "50%",
            background: `radial-gradient(circle, 
              rgba(${sun.r * 255},${sun.g * 255},${sun.b * 255},${sun.intensity * 0.15}) 0%, 
              transparent 70%)`,
            transform: "translate(-50%, -50%)",
            filter: "blur(40px)",
          }}
        />
      )}

      {/* Stars — visible at night, fade during day */}
      <svg className="absolute inset-0 h-full w-full">
        {stars.map((s) => (
          <circle
            key={s.id}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.size}
            fill="#ffffff"
            opacity={s.opacity * (1 - sun.intensity * 0.9)}
          >
            <animate
              attributeName="opacity"
              values={`${s.opacity * (1 - sun.intensity * 0.9)};${s.opacity * 0.3 * (1 - sun.intensity * 0.9)};${s.opacity * (1 - sun.intensity * 0.9)}`}
              dur={`${2 + s.size}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      {/* Electric blue ambient glow — top right */}
      <div
        className="absolute -right-48 -top-48 h-[600px] w-[600px] rounded-full opacity-[0.04] blur-[200px]"
        style={{ background: "radial-gradient(circle, #00d4ff 0%, transparent 70%)" }}
      />

      {/* Emerald ambient glow — bottom left */}
      <div
        className="absolute -bottom-48 -left-48 h-[500px] w-[500px] rounded-full opacity-[0.03] blur-[180px]"
        style={{ background: "radial-gradient(circle, #00f593 0%, transparent 70%)" }}
      />

      {/* Purple ambient glow — bottom right */}
      <div
        className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full opacity-[0.03] blur-[160px]"
        style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}
      />

      {/* Dot grid — subtle tech texture */}
      <svg className="absolute inset-0 h-full w-full">
        {dots.map((d) => (
          <circle
            key={d.id}
            cx={`${d.x}%`}
            cy={`${d.y}%`}
            r={d.size}
            fill="#00d4ff"
            opacity={d.opacity * (0.3 + sun.intensity * 0.7)}
          >
            <animate
              attributeName="opacity"
              values={`${d.opacity * (0.3 + sun.intensity * 0.7)};${d.opacity * 0.2};${d.opacity * (0.3 + sun.intensity * 0.7)}`}
              dur={`${d.twinkle}s`}
              begin={`${d.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      {/* Subtle horizontal grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)",
          backgroundSize: "100% 48px",
        }}
      />

      {/* Subtle vertical grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px)",
          backgroundSize: "48px 100%",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, transparent 30%, rgba(7,9,15,0.7) 100%)",
        }}
      />
    </div>
  );
}
