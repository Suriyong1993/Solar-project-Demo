import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";

/**
 * Off-grid MPPT energy scene.
 *
 * Topology:
 *           ☀ SUN
 *             │
 *         🟦 Solar Panels
 *             │
 *      ┌──────▼──────┐
 *      │  HM-6096     │  (MPPT charge controller — center of system)
 *      └─┬─────────┬─┘
 *        ▼         ▼
 *      🔋 Battery  🏠 DC Load
 *
 * Energy flow particles travel:
 *   Sun → Panels → Controller → Battery (when charging)
 *   Controller → Load (always when load > 0)
 *   Battery → Controller → Load (when solar < load, i.e. discharging)
 */

type Props = {
  solarKw: number;
  batteryPct: number;
  loadKw: number;
  batteryFlowKw: number; // + charging, - discharging
};

export function EnergyScene(props: Props) {
  return (
    <div className="relative h-[520px] w-full sm:h-[600px] md:h-[660px]">
      {/* Soft halo behind the canvas */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(250,204,21,0.10), transparent 60%), radial-gradient(ellipse 70% 60% at 50% 90%, rgba(16,185,129,0.08), transparent 70%)",
        }}
      />
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 1.2, 9], fov: 42 }}
      >
        <color attach="background" args={["#00000000"]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 8, 5]} intensity={0.9} color="#fde68a" />
        <pointLight position={[-4, 2, 3]} intensity={0.6} color="#38bdf8" />
        <Suspense fallback={null}>
          <Scene {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}

const POS = {
  sun: new THREE.Vector3(0, 3.2, 0),
  panels: new THREE.Vector3(0, 1.5, 0),
  controller: new THREE.Vector3(0, -0.2, 0),
  battery: new THREE.Vector3(-2.4, -1.9, 0),
  load: new THREE.Vector3(2.4, -1.9, 0),
};

function Scene({ solarKw, batteryPct, loadKw, batteryFlowKw }: Props) {
  const charging = batteryFlowKw >= 0;

  return (
    <group>
      <Float speed={1} rotationIntensity={0} floatIntensity={0.4}>
        <Sun position={POS.sun} intensity={solarKw} />
      </Float>

      <Panels position={POS.panels} />
      <Controller position={POS.controller} />
      <Battery position={POS.battery} pct={batteryPct} charging={charging} />
      <Load position={POS.load} kw={loadKw} />

      {/* Energy flows */}
      <Flow from={POS.sun} to={POS.panels} color="#facc15" speed={1.2} count={6} active={solarKw > 0.2} />
      <Flow from={POS.panels} to={POS.controller} color="#facc15" speed={1.4} count={6} active={solarKw > 0.2} />

      {/* Controller -> Battery (charging) or Battery -> Controller (discharging) */}
      <Flow
        from={charging ? POS.controller : POS.battery}
        to={charging ? POS.battery : POS.controller}
        color={charging ? "#10b981" : "#f59e0b"}
        speed={1.0 + Math.min(2, Math.abs(batteryFlowKw) * 0.25)}
        count={5}
        active
      />

      {/* Controller -> Load (always while load > 0) */}
      <Flow from={POS.controller} to={POS.load} color="#38bdf8" speed={1.2 + loadKw * 0.2} count={5} active={loadKw > 0.05} />

      {/* HTML overlay labels */}
      <Label position={[POS.sun.x, POS.sun.y + 0.95, 0]} color="#facc15" title="SUN" value={`${solarKw.toFixed(2)} kW`} />
      <Label position={[POS.panels.x + 1.7, POS.panels.y, 0]} color="#fde68a" title="PANELS" value="6× 450W" />
      <Label position={[POS.controller.x - 2.3, POS.controller.y + 0.1, 0]} color="#38bdf8" title="HM-6096" value="MPPT" />
      <Label position={[POS.battery.x, POS.battery.y - 1.05, 0]} color="#10b981" title="BATTERY" value={`${batteryPct.toFixed(0)}%`} />
      <Label position={[POS.load.x, POS.load.y - 1.05, 0]} color="#38bdf8" title="DC LOAD" value={`${loadKw.toFixed(2)} kW`} />
    </group>
  );
}

/* ---------------------------------- Sun ---------------------------------- */
function Sun({ position, intensity }: { position: THREE.Vector3; intensity: number }) {
  const core = useRef<THREE.Mesh>(null);
  const corona = useRef<THREE.Mesh>(null);
  const rays = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (core.current) {
      const s = 1 + Math.sin(performance.now() * 0.0015) * 0.04;
      core.current.scale.setScalar(s);
    }
    if (corona.current) {
      corona.current.rotation.z += dt * 0.05;
    }
    if (rays.current) {
      rays.current.rotation.z += dt * 0.08;
    }
  });
  const rayArray = useMemo(() => Array.from({ length: 12 }), []);
  return (
    <group position={position}>
      {/* outer glow */}
      <mesh ref={corona}>
        <sphereGeometry args={[1.05, 24, 24]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.12} />
      </mesh>
      {/* core */}
      <mesh ref={core}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color="#facc15"
          emissive="#fbbf24"
          emissiveIntensity={1.4 + Math.min(intensity * 0.1, 0.6)}
          roughness={0.4}
        />
      </mesh>
      {/* rays */}
      <group ref={rays}>
        {rayArray.map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.92, Math.sin(a) * 0.92, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[0.22, 0.04, 0.04]} />
              <meshBasicMaterial color="#fde68a" transparent opacity={0.85} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/* -------------------------------- Panels --------------------------------- */
function Panels({ position }: { position: THREE.Vector3 }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (group.current) {
      group.current.rotation.x = -0.55 + Math.sin(performance.now() * 0.0006) * 0.02;
    }
  });
  // Low-poly grid of cells
  const cells = useMemo(() => {
    const arr: { x: number; y: number }[] = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) arr.push({ x: c, y: r });
    return arr;
  }, []);
  return (
    <group position={position}>
      <group ref={group}>
        {/* frame */}
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[2.7, 1.45, 0.08]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} metalness={0.6} />
        </mesh>
        {/* glass */}
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[2.6, 1.35]} />
          <meshStandardMaterial color="#0b1220" emissive="#1e3a8a" emissiveIntensity={0.18} roughness={0.2} metalness={0.4} />
        </mesh>
        {/* cells */}
        {cells.map((c, i) => (
          <mesh key={i} position={[-1.15 + c.x * 0.42, -0.45 + c.y * 0.45, 0.012]}>
            <planeGeometry args={[0.38, 0.4]} />
            <meshStandardMaterial color="#0e1a36" emissive="#3b82f6" emissiveIntensity={0.18} roughness={0.3} />
          </mesh>
        ))}
      </group>
      {/* stand */}
      <mesh position={[0, -0.95, -0.1]}>
        <boxGeometry args={[0.18, 0.7, 0.18]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ------------------------------ Controller ------------------------------- */
function Controller({ position }: { position: THREE.Vector3 }) {
  const led = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (led.current) {
      const m = led.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 1.2 + Math.sin(performance.now() * 0.006) * 0.6;
    }
  });
  return (
    <group position={position}>
      {/* halo */}
      <mesh position={[0, 0, -0.2]}>
        <ringGeometry args={[1.05, 1.35, 48]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
      {/* body */}
      <mesh>
        <boxGeometry args={[1.9, 1.1, 0.45]} />
        <meshStandardMaterial color="#0b1424" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* faceplate */}
      <mesh position={[0, 0, 0.226]}>
        <planeGeometry args={[1.78, 0.98]} />
        <meshStandardMaterial color="#111827" emissive="#0ea5e9" emissiveIntensity={0.08} roughness={0.4} />
      </mesh>
      {/* screen */}
      <mesh position={[-0.35, 0.12, 0.232]}>
        <planeGeometry args={[0.9, 0.42]} />
        <meshStandardMaterial color="#020617" emissive="#38bdf8" emissiveIntensity={0.55} />
      </mesh>
      {/* status LED */}
      <mesh ref={led} position={[0.55, 0.3, 0.232]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={1.6} />
      </mesh>
      {/* label etch */}
      <Html position={[-0.35, 0.12, 0.25]} center transform distanceFactor={4} style={{ pointerEvents: "none" }}>
        <div style={{ color: "#7dd3fc", fontFamily: "Space Grotesk, Inter", fontWeight: 600, fontSize: 22, letterSpacing: 2 }}>
          HM-6096
        </div>
      </Html>
      <Html position={[0.4, -0.28, 0.25]} center transform distanceFactor={5} style={{ pointerEvents: "none" }}>
        <div style={{ color: "#64748b", fontFamily: "Space Grotesk, Inter", fontWeight: 500, fontSize: 14, letterSpacing: 3 }}>
          MPPT · 60A
        </div>
      </Html>
    </group>
  );
}

/* -------------------------------- Battery -------------------------------- */
function Battery({ position, pct, charging }: { position: THREE.Vector3; pct: number; charging: boolean }) {
  const fillRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (fillRef.current) {
      const target = (pct / 100) * 0.92;
      fillRef.current.scale.y = THREE.MathUtils.lerp(fillRef.current.scale.y, target, 0.05);
      fillRef.current.position.y = -0.46 + (fillRef.current.scale.y * 1) / 2;
    }
  });
  return (
    <group position={position}>
      {/* shell */}
      <mesh>
        <boxGeometry args={[1.1, 1.05, 0.5]} />
        <meshStandardMaterial color="#0b1424" roughness={0.5} metalness={0.55} />
      </mesh>
      {/* terminal */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.32, 0.12, 0.18]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {/* fill */}
      <mesh ref={fillRef} position={[0, -0.46, 0.26]} scale={[1, 0.001, 1]}>
        <planeGeometry args={[0.92, 1]} />
        <meshStandardMaterial
          color={charging ? "#10b981" : "#f59e0b"}
          emissive={charging ? "#10b981" : "#f59e0b"}
          emissiveIntensity={0.6}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* faceplate frame */}
      <mesh position={[0, 0, 0.255]}>
        <planeGeometry args={[0.96, 0.94]} />
        <meshBasicMaterial color="#000" transparent opacity={0.0} />
      </mesh>
      <Html position={[0, 0, 0.27]} center transform distanceFactor={3.5} style={{ pointerEvents: "none" }}>
        <div
          style={{
            color: "#ecfdf5",
            fontFamily: "Space Grotesk, Inter",
            fontWeight: 700,
            fontSize: 32,
            textShadow: "0 0 12px rgba(16,185,129,0.6)",
          }}
        >
          {pct.toFixed(0)}%
        </div>
      </Html>
    </group>
  );
}

/* ---------------------------------- Load --------------------------------- */
function Load({ position, kw }: { position: THREE.Vector3; kw: number }) {
  const win = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (win.current) {
      win.current.emissiveIntensity = 0.6 + Math.min(kw * 0.4, 1.2) + Math.sin(performance.now() * 0.004) * 0.1;
    }
  });
  return (
    <group position={position}>
      {/* body */}
      <mesh>
        <boxGeometry args={[1.1, 1.0, 0.55]} />
        <meshStandardMaterial color="#0f172a" roughness={0.55} metalness={0.4} />
      </mesh>
      {/* roof */}
      <mesh position={[0, 0.68, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.78, 0.78, 0.55]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      {/* window */}
      <mesh position={[0, -0.05, 0.28]}>
        <planeGeometry args={[0.55, 0.4]} />
        <meshStandardMaterial ref={win} color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.9} />
      </mesh>
      {/* door */}
      <mesh position={[-0.32, -0.3, 0.28]}>
        <planeGeometry args={[0.18, 0.4]} />
        <meshStandardMaterial color="#020617" />
      </mesh>
    </group>
  );
}

/* ---------------------------------- Flow --------------------------------- */
function Flow({
  from,
  to,
  color,
  speed,
  count,
  active,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  speed: number;
  count: number;
  active: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const offsets = useMemo(() => Array.from({ length: count }, (_, i) => i / count), [count]);
  const tubeGeom = useMemo(() => {
    const curve = new THREE.LineCurve3(from.clone(), to.clone());
    return new THREE.TubeGeometry(curve, 1, 0.018, 6, false);
  }, [from, to]);
  useFrame((_, dt) => {
    if (!group.current || !active) return;
    group.current.children.forEach((child, i) => {
      const m = child as THREE.Mesh;
      const baseT = offsets[i];
      const t = ((performance.now() / 1000) * speed * 0.25 + baseT) % 1;
      m.position.lerpVectors(from, to, t);
      const s = 0.9 + Math.sin(t * Math.PI) * 0.6;
      m.scale.setScalar(s);
    });
  });
  return (
    <group>
      {/* faint tube backbone */}
      <mesh geometry={tubeGeom}>
        <meshBasicMaterial color={color} transparent opacity={active ? 0.22 : 0.06} />
      </mesh>
      {active && (
        <group ref={group}>
          {offsets.map((_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshBasicMaterial color={color} transparent opacity={0.95} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

/* --------------------------------- Label --------------------------------- */
function Label({
  position,
  color,
  title,
  value,
}: {
  position: [number, number, number];
  color: string;
  title: string;
  value: string;
}) {
  // Only render the HTML overlay client-side to avoid hydration mismatches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Html position={position} center style={{ pointerEvents: "none" }}>
      <div
        className="glass whitespace-nowrap rounded-xl px-2.5 py-1.5"
        style={{ boxShadow: `0 8px 30px rgba(0,0,0,0.4), 0 0 24px ${color}33` }}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
          <span className="font-display text-[9px] font-semibold tracking-[0.18em] text-slate-300">{title}</span>
        </div>
        <div className="mt-0.5 font-display text-[12px] font-semibold tabular-nums" style={{ color }}>
          {value}
        </div>
      </Html>
  );
}
