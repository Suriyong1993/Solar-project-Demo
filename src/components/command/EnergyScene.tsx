import { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, MeshDistortMaterial, Line, OrbitControls, Stars } from "@react-three/drei";
import { Cpu } from "lucide-react";
import * as THREE from "three";

type EnergySceneProps = {
  solarKw: number;
  batteryPct: number;
  loadKw: number;
  batteryFlowKw: number;
  selectedNode: string | null;
  onSelectNode: (node: string | null) => void;
};

export function EnergyScene({
  solarKw,
  batteryPct,
  loadKw,
  batteryFlowKw,
  selectedNode,
  onSelectNode,
}: EnergySceneProps) {
  return (
    <div className="relative h-[400px] w-full rounded-lg border border-white/[0.06] bg-[#050816] overflow-hidden md:h-[560px]">
      {/* HUD frame — refined, minimal */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* Corner marks */}
        <div className="absolute top-3 left-3 h-3 w-3 border-t border-l border-[#d4a032]/30" />
        <div className="absolute top-3 right-3 h-3 w-3 border-t border-r border-[#d4a032]/30" />
        <div className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-[#d4a032]/30" />
        <div className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-[#d4a032]/30" />

        {/* Top labels */}
        <div className="absolute top-3 left-5 text-[8px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#3a3a4a", fontFamily: "JetBrains Mono" }}>
          [ 3D TELEMETRY ]
        </div>
        <div className="absolute top-3 right-5 flex items-center gap-1.5">
          <span className="relative flex h-1 w-1">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2dd4bf] opacity-50" />
            <span className="relative inline-flex h-1 w-1 rounded-full bg-[#2dd4bf]" />
          </span>
          <span className="text-[8px] font-semibold uppercase tracking-wider" style={{ color: "#2dd4bf", fontFamily: "JetBrains Mono" }}>
            RENDERING
          </span>
        </div>

        {/* Bottom hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#3a3a4a", fontFamily: "JetBrains Mono" }}>
          DRAG · ROTATE · SCROLL · ZOOM · CLICK · INSPECT
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 1.5, 7.5], fov: 48 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#00000000"]} />
        <fog attach="fog" args={["#050816", 16, 28]} />

        <ambientLight intensity={0.2} />
        <pointLight position={[0, 4, 5]} intensity={1.5} color="#d4a032" />
        <pointLight position={[5, 2, 2]} intensity={0.8} color="#2dd4bf" />
        <pointLight position={[-5, -2, 2]} intensity={0.6} color="#dc4446" />
        <pointLight position={[-3.5, 2, -2]} intensity={0.5} color="#60a5fa" />

        <Stars radius={30} depth={15} count={600} factor={3} saturation={0} fade speed={0.3} />

        <Suspense fallback={null}>
          <Scene
            solarKw={solarKw}
            batteryPct={batteryPct}
            loadKw={loadKw}
            batteryFlowKw={batteryFlowKw}
            selectedNode={selectedNode}
            onSelectNode={onSelectNode}
          />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          maxDistance={12}
          minDistance={4}
          maxPolarAngle={Math.PI / 2 + 0.2}
          minPolarAngle={Math.PI / 5}
          autoRotate={!selectedNode}
          autoRotateSpeed={0.25}
        />
      </Canvas>
    </div>
  );
}

const POS = {
  sun: new THREE.Vector3(-3.2, 1.8, 0),
  controller: new THREE.Vector3(0, 0, 0),
  battery: new THREE.Vector3(-2.8, -1.8, 0),
  load: new THREE.Vector3(2.8, -1.5, 0),
};

function Scene({
  solarKw,
  batteryPct,
  loadKw,
  batteryFlowKw,
  selectedNode,
  onSelectNode,
}: EnergySceneProps) {
  const charging = batteryFlowKw >= 0;

  return (
    <group>
      {/* Subtle grid floor */}
      <gridHelper args={[18, 26, "#1a1a24", "#0e0e14"]} position={[0, -2.9, 0]}>
        <lineBasicMaterial attach="material" opacity={0.08} transparent />
      </gridHelper>

      {/* Ring under core */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.88, 0]}>
        <ringGeometry args={[1.6, 1.62, 48]} />
        <meshBasicMaterial color="#d4a032" transparent opacity={0.12} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.87, 0]}>
        <ringGeometry args={[2.2, 2.21, 48]} />
        <meshBasicMaterial color="#2dd4bf" transparent opacity={0.06} />
      </mesh>

      {/* Core orb */}
      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.4}>
        <group onClick={(e) => { e.stopPropagation(); onSelectNode("controller"); }}>
          <ControllerOrb
            solarKw={solarKw}
            batteryPct={batteryPct}
            isSelected={selectedNode === "controller"}
          />
        </group>
      </Float>

      {/* Solar */}
      <group onClick={(e) => { e.stopPropagation(); onSelectNode("solar"); }}>
        <EnergySun position={POS.sun} intensity={solarKw} isSelected={selectedNode === "solar"} />
      </group>

      {/* Battery */}
      <group onClick={(e) => { e.stopPropagation(); onSelectNode("battery"); }}>
        <BatteryCell position={POS.battery} pct={batteryPct} charging={charging} isSelected={selectedNode === "battery"} />
      </group>

      {/* Load */}
      <group onClick={(e) => { e.stopPropagation(); onSelectNode("load"); }}>
        <EarthLoad position={POS.load} kw={loadKw} isSelected={selectedNode === "load"} />
      </group>

      {/* Energy arcs */}
      <LightningArc from={POS.sun} to={POS.controller} color="#d4a032" active={solarKw > 0.05} speed={0.7} />
      <LightningArc from={charging ? POS.controller : POS.battery} to={charging ? POS.battery : POS.controller} color={charging ? "#2dd4bf" : "#dc4446"} active={Math.abs(batteryFlowKw) > 0.05} speed={0.55} />
      <LightningArc from={POS.controller} to={POS.load} color="#60a5fa" active={loadKw > 0.05} speed={0.6} />

      {/* Labels */}
      <Label position={[POS.sun.x, POS.sun.y + 1.1, 0]} color="#d4a032" title="SOLAR" value={`${solarKw.toFixed(2)} kW`} isSelected={selectedNode === "solar"} />
      <Label position={[POS.battery.x, POS.battery.y - 1.15, 0]} color="#2dd4bf" title="BATTERY" value={`${batteryPct.toFixed(0)}%`} isSelected={selectedNode === "battery"} />
      <Label position={[POS.load.x, POS.load.y - 1.1, 0]} color="#60a5fa" title="LOAD" value={`${loadKw.toFixed(2)} kW`} isSelected={selectedNode === "load"} />
    </group>
  );
}

/* ===== CORE ORB ===== */
function ControllerOrb({ solarKw, batteryPct, isSelected }: { solarKw: number; batteryPct: number; isSelected: boolean }) {
  const orb = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Group>(null);
  const outerGlow = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (orb.current) {
      const mat = orb.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.8 + Math.sin(t * 2) * 0.15 + (solarKw / 6) * 0.3;
      orb.current.rotation.y = t * 0.15;
    }
    if (rings.current) {
      rings.current.rotation.z = -t * 0.25;
      rings.current.rotation.x = Math.sin(t * 0.12) * 0.08;
    }
    if (outerGlow.current) {
      const mat = outerGlow.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (isSelected ? 0.1 : 0.04) + Math.sin(t * 1.5) * 0.01;
    }
  });

  return (
    <group>
      <mesh ref={outerGlow} scale={2.2}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#d4a032" transparent opacity={0.06} />
      </mesh>

      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.95, 2.0, 48]} />
          <meshBasicMaterial color="#d4a032" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      )}

      <mesh ref={orb}>
        <sphereGeometry args={[1.0, 48, 48]} />
        <MeshDistortMaterial
          color="#050816"
          emissive="#d4a032"
          emissiveIntensity={1.0}
          distort={isSelected ? 0.3 : 0.15}
          speed={isSelected ? 2.5 : 1.2}
          roughness={0.1}
          metalness={0.85}
        />
      </mesh>

      <group ref={rings}>
        {[1.3, 1.5, 1.7].map((r, i) => (
          <mesh key={i} rotation={[Math.PI / 2 + i * 0.25, i * 0.35, 0]}>
            <torusGeometry args={[r, 0.012, 10, 64]} />
            <meshBasicMaterial color="#d4a032" transparent opacity={0.5 - i * 0.15} />
          </mesh>
        ))}
      </group>

      <Html position={[0, 0.1, 1.2]} center transform distanceFactor={2.4} style={{ pointerEvents: "none" }}>
        <div
          className="rounded-lg p-2 transition-all duration-300"
          style={{
            minWidth: 120,
            background: "rgba(12,12,18,0.9)",
            border: `1px solid ${isSelected ? "rgba(212,160,50,0.3)" : "rgba(255,255,255,0.06)"}`,
            boxShadow: isSelected ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          <div className="text-center" style={{ fontFamily: "JetBrains Mono" }}>
            <div className="flex items-center justify-center gap-1 text-[8px] font-bold tracking-widest" style={{ color: "#6b6b7b" }}>
              <Cpu className="h-2.5 w-2.5" />
              MPPT CORE
            </div>
            <div className="mt-0.5 text-[16px] font-bold" style={{ color: "#e2e2e8", fontFamily: "Chakra Petch" }}>HM-6096</div>
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ===== SOLAR SUN ===== */
function EnergySun({ position, intensity, isSelected }: { position: THREE.Vector3; intensity: number; isSelected: boolean }) {
  const core = useRef<THREE.Mesh>(null);
  const corona = useRef<THREE.Mesh>(null);
  const coronaRing = useRef<THREE.Mesh>(null);
  const rays = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (core.current) {
      const s = (isSelected ? 1.12 : 1.0) + Math.sin(t * 2) * 0.05;
      core.current.scale.setScalar(s);
      const mat = core.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.5 + intensity * 0.2 + (isSelected ? 0.5 : 0) + Math.sin(t * 2.5) * 0.1;
    }
    if (corona.current) {
      corona.current.rotation.z = t * 0.12;
      const mat = corona.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + Math.sin(t * 1.2) * 0.05 + (isSelected ? 0.08 : 0);
    }
    if (coronaRing.current) {
      coronaRing.current.rotation.z = -t * 0.18;
    }
    if (rays.current) {
      rays.current.rotation.z = t * 0.08;
    }
  });

  return (
    <group position={position}>
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 0.95, 40]} />
          <meshBasicMaterial color="#d4a032" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      )}

      <mesh ref={corona} scale={1.6}>
        <sphereGeometry args={[0.4, 20, 20]} />
        <meshBasicMaterial color="#d4a032" transparent opacity={0.08} />
      </mesh>

      <mesh ref={coronaRing}>
        <torusGeometry args={[0.55, 0.06, 10, 40]} />
        <meshBasicMaterial color="#b8860b" transparent opacity={0.3} />
      </mesh>

      <mesh ref={core}>
        <sphereGeometry args={[0.4, 40, 40]} />
        <meshStandardMaterial color="#d4a032" emissive="#b8860b" emissiveIntensity={2} roughness={0.05} metalness={0.4} />
      </mesh>

      <group ref={rays}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const len = i % 2 === 0 ? 0.24 : 0.15;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[len, 0.03, 0.03]} />
              <meshBasicMaterial color="#d4a032" transparent opacity={0.6} />
            </mesh>
          );
        })}
      </group>

      <pointLight color="#d4a032" intensity={intensity * 0.4 + 0.2} distance={5} decay={2} />
    </group>
  );
}

/* ===== BATTERY CELL ===== */
function BatteryCell({ position, pct, charging, isSelected }: { position: THREE.Vector3; pct: number; charging: boolean; isSelected: boolean }) {
  const fill = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);

  const accentColor = charging ? "#2dd4bf" : "#dc4446";

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (fill.current) {
      const targetScale = Math.max(0.02, (pct / 100) * 1.05);
      fill.current.scale.y = THREE.MathUtils.lerp(fill.current.scale.y, targetScale, 0.05);
      const yOff = -0.5 + (fill.current.scale.y * 1.05) / 2;
      fill.current.position.y = yOff;
      const mat = fill.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(t * (charging ? 2 : 1)) * 0.1;
    }
    if (shell.current) {
      const mat = shell.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = isSelected ? 0.5 : (charging ? 0.25 : 0.1);
    }
  });

  return (
    <group position={position}>
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 0.95, 40]} />
          <meshBasicMaterial color={accentColor} side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      )}

      <mesh scale={[1.2, 1.05, 1.2]}>
        <cylinderGeometry args={[0.45, 0.45, 1.15, 28]} />
        <meshBasicMaterial color={accentColor} transparent opacity={isSelected ? 0.06 : 0.03} />
      </mesh>

      <mesh ref={shell}>
        <cylinderGeometry args={[0.42, 0.42, 1.15, 28]} />
        <meshStandardMaterial color="#0e0e14" emissive={accentColor} emissiveIntensity={0.15} roughness={0.12} metalness={0.9} />
      </mesh>

      <mesh position={[0, 0.68, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.08, 20]} />
        <meshStandardMaterial color="#1a1a24" metalness={0.95} roughness={0.12} />
      </mesh>
      <mesh position={[0, -0.62, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.03, 28]} />
        <meshStandardMaterial color="#0e0e14" metalness={0.9} roughness={0.15} />
      </mesh>

      <mesh ref={fill} position={[0, -0.5, 0]} scale={[0.85, 0.01, 0.85]}>
        <cylinderGeometry args={[0.37, 0.37, 1.02, 28]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.6} transparent opacity={0.7} />
      </mesh>

      {charging && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <torusGeometry args={[0.5, 0.018, 8, 40]} />
          <meshBasicMaterial color="#2dd4bf" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}

/* ===== EARTH LOAD NODE ===== */
function EarthLoad({ position, kw, isSelected }: { position: THREE.Vector3; kw: number; isSelected: boolean }) {
  const planet = useRef<THREE.Mesh>(null);
  const atmosphere = useRef<THREE.Mesh>(null);
  const city = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (planet.current) planet.current.rotation.y = t * 0.12;
    if (atmosphere.current) {
      const mat = atmosphere.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.1 + Math.sin(t * 1) * 0.02 + (isSelected ? 0.05 : 0);
    }
    if (city.current) {
      const mat = city.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.min(kw * 0.3, 1) + Math.sin(t * 2.5) * 0.1;
    }
  });

  return (
    <group position={position}>
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 0.95, 40]} />
          <meshBasicMaterial color="#60a5fa" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      )}

      <mesh ref={atmosphere} scale={1.15}>
        <sphereGeometry args={[0.45, 20, 20]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>

      <mesh ref={planet}>
        <sphereGeometry args={[0.45, 40, 40]} />
        <meshStandardMaterial color="#0a0a14" emissive="#000820" emissiveIntensity={0.4} roughness={0.6} metalness={0.3} />
      </mesh>

      <mesh ref={city} position={[0.02, 0.08, 0.42]}>
        <planeGeometry args={[0.4, 0.3]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.8} transparent opacity={0.5} />
      </mesh>

      <mesh position={[-0.15, -0.04, 0.4]} rotation={[0, 0.2, 0.1]}>
        <planeGeometry args={[0.2, 0.15]} />
        <meshBasicMaterial color="#1a3a2a" transparent opacity={0.4} />
      </mesh>

      <mesh rotation={[Math.PI / 2 - 0.25, 0, 0]}>
        <torusGeometry args={[0.68, 0.01, 6, 56]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={isSelected ? 0.35 : 0.1} />
      </mesh>
    </group>
  );
}

/* ===== ENERGY ARC ===== */
function LightningArc({ from, to, color, active, speed = 0.6 }: { from: THREE.Vector3; to: THREE.Vector3; color: string; active: boolean; speed?: number }) {
  const particles = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];

  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 16;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const pos = new THREE.Vector3().lerpVectors(from, to, t);
      const arcFactor = Math.sin(t * Math.PI) * 0.4;
      pos.y += arcFactor;
      pts.push(pos);
    }
    return pts;
  }, [from, to]);

  const offsets = useMemo(() => [0, 0.33, 0.66], []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    particles.forEach((pRef, idx) => {
      const mesh = pRef.current;
      if (!mesh || !active) return;
      const progress = ((t * speed + offsets[idx]) % 1 + 1) % 1;
      const segProg = progress * (points.length - 1);
      const index = Math.min(Math.floor(segProg), points.length - 2);
      const subT = segProg - index;
      const p0 = points[index];
      const p1 = points[index + 1];
      mesh.position.set(
        p0.x + (p1.x - p0.x) * subT,
        p0.y + (p1.y - p0.y) * subT,
        p0.z + (p1.z - p0.z) * subT
      );
      const baseSize = idx === 0 ? 0.08 : 0.055;
      mesh.scale.setScalar(baseSize * (0.9 + Math.sin(t * 10 + offsets[idx] * 15) * 0.25));
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = idx === 0 ? 0.9 : 0.5 - idx * 0.1;
    });
  });

  if (!active) return null;

  return (
    <>
      <Line points={points} color={color} transparent opacity={0.35} lineWidth={2} />
      {particles.map((pRef, i) => (
        <mesh key={i} ref={pRef}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={i === 0 ? 0.8 : 0.4} />
        </mesh>
      ))}
    </>
  );
}

/* ===== HUD LABELS ===== */
function Label({ position, color, title, value, isSelected }: { position: [number, number, number]; color: string; title: string; value: string; isSelected: boolean }) {
  return (
    <Html position={position} center style={{ pointerEvents: "none" }}>
      <div
        className="whitespace-nowrap rounded-lg px-3 py-1.5 transition-all duration-300"
        style={{
          background: isSelected ? "rgba(12,12,18,0.95)" : "rgba(12,12,18,0.75)",
          border: `1px solid ${isSelected ? color : "rgba(255,255,255,0.06)"}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontFamily: "JetBrains Mono", textAlign: "center" }}>
          <div className="text-[8px] font-bold tracking-[0.2em]" style={{ color: "#6b6b7b" }}>{title}</div>
          <div className="mt-0.5 text-sm font-bold tabular-nums" style={{ color, textShadow: `0 0 8px ${color}40` }}>
            {value}
          </div>
        </div>
      </div>
    </Html>
  );
}
