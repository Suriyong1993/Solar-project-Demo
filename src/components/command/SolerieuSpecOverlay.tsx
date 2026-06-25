import { motion, AnimatePresence } from "framer-motion";
import { X, Layers, Grid, Compass, RefreshCw, Eye, Star } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function SolerieuSpecOverlay({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-[#050816]/98 backdrop-blur-sm"
        >
          {/* Grid bg */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#050816]/90 px-5 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded border border-[#d4a032]/20 bg-[#d4a032]/5">
                <Compass className="h-4 w-4 text-[#d4a032]" />
              </div>
              <div>
                <div
                  className="text-xs font-semibold tracking-wider"
                  style={{ color: "#d4a032", fontFamily: "Chakra Petch" }}
                >
                  DESIGN SPECIFICATIONS
                </div>
                <div
                  className="text-[9px] uppercase tracking-widest"
                  style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                >
                  Solar Monitor Design Language
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded border border-white/[0.06] bg-white/[0.02] transition-all hover:border-[#dc4446]/20 hover:bg-[#dc4446]/5"
            >
              <X className="h-4 w-4" style={{ color: "#6b6b7b" }} />
            </button>
          </header>

          <main className="mx-auto max-w-[1200px] px-5 py-10">
            <div className="mb-12 border-l border-[#d4a032]/20 pl-5">
              <div
                className="text-[9px] font-semibold uppercase tracking-[0.25em]"
                style={{ color: "#d4a032", fontFamily: "JetBrains Mono" }}
              >
                Design Philosophy
              </div>
              <h2
                className="mt-2 text-2xl font-bold sm:text-4xl"
                style={{ color: "#e2e2e8", fontFamily: "Chakra Petch" }}
              >
                AEROSPACE TELEMETRY UI
              </h2>
              <p
                className="mt-3 max-w-xl text-xs leading-relaxed"
                style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
              >
                Inspired by NASA/SpaceX mission control. Precise data hierarchy, restrained color
                palette, and functional beauty over decorative noise.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SpecCard
                num="01"
                title="Contrast"
                icon={<Eye className="h-3.5 w-3.5" />}
                color="amber"
              >
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                >
                  Deep space-blue background (#050816) with warm amber accents for critical data. No
                  neon, no noise.
                </p>
              </SpecCard>

              <SpecCard
                num="02"
                title="Hierarchy"
                icon={<Layers className="h-3.5 w-3.5" />}
                color="teal"
              >
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                >
                  JetBrains Mono for data, Chakra Petch for headers. Values dominate, labels recede.
                </p>
              </SpecCard>

              <SpecCard
                num="03"
                title="Precision"
                icon={<Grid className="h-3.5 w-3.5" />}
                color="cool"
              >
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                >
                  1px borders at 6% opacity. No blur, no glow. Clean panel edges with subtle inset
                  highlight.
                </p>
              </SpecCard>

              <SpecCard
                num="04"
                title="Restraint"
                icon={<Star className="h-3.5 w-3.5" />}
                color="warm"
              >
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                >
                  Three colors max: amber (solar), teal (battery), cool blue (load). Everything else
                  is grayscale.
                </p>
              </SpecCard>

              <SpecCard
                num="05"
                title="Consistency"
                icon={<RefreshCw className="h-3.5 w-3.5" />}
                color="teal"
              >
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                >
                  Single panel style everywhere. Same border, same shadow, same radius. Predictable,
                  professional.
                </p>
              </SpecCard>

              <SpecCard num="06" title="Focus" icon={<Eye className="h-3.5 w-3.5" />} color="amber">
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                >
                  3D scene is the hero. UI frames it, never competes. Inspector panel is compact,
                  data-dense.
                </p>
              </SpecCard>

              <SpecCard
                num="07"
                title="Clarity"
                icon={<Grid className="h-3.5 w-3.5" />}
                color="cool"
              >
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                >
                  Monospace numbers, tabular nums, aligned decimals. Every value reads instantly.
                </p>
              </SpecCard>

              <SpecCard num="08" title="Unity" icon={<Star className="h-3.5 w-3.5" />} color="warm">
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                >
                  One system: Aerospace Telemetry. From font choice to color to spacing, every pixel
                  serves the mission.
                </p>
              </SpecCard>
            </div>

            <div className="mt-12 rounded-lg border border-white/[0.06] bg-[#050816] p-6">
              <h3
                className="mb-4 text-sm font-bold tracking-wider"
                style={{ color: "#d4a032", fontFamily: "Chakra Petch" }}
              >
                VISUAL COMPOSITION SPECS
              </h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="relative aspect-video rounded border border-white/[0.04] bg-[#050816] p-4 flex flex-col justify-between overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "radial-gradient(rgba(255,255,255,0.015) 1px,transparent 1px)",
                      backgroundSize: "12px 12px",
                    }}
                  />
                  <div
                    className="absolute top-8 left-8 w-20 h-20 rounded-full border border-dashed"
                    style={{ borderColor: "rgba(212,160,50,0.15)" }}
                  />
                  <div
                    className="absolute right-8 bottom-8 w-24 h-14 rounded border border-dashed"
                    style={{ borderColor: "rgba(96,165,250,0.1)" }}
                  />
                  <div
                    className="absolute top-4 left-1/2 -translate-x-1/2 h-full w-[1px]"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  />
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-full h-[1px]"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  />
                  <div
                    className="z-10 text-[8px] tracking-wider"
                    style={{ color: "#3a3a4a", fontFamily: "JetBrains Mono" }}
                  >
                    BLUEPRINT_VIEW v3.0
                  </div>
                </div>
                <div className="flex flex-col justify-center space-y-3">
                  <h4
                    className="text-[10px] font-bold uppercase tracking-[0.15em]"
                    style={{ color: "#e2e2e8", fontFamily: "JetBrains Mono" }}
                  >
                    Development Guidelines
                  </h4>
                  <ul
                    className="space-y-2 text-[11px]"
                    style={{ color: "#6b6b7b", fontFamily: "JetBrains Mono" }}
                  >
                    <li className="flex items-start gap-2">
                      <span style={{ color: "#d4a032" }}>◆</span>
                      <span>Signal over noise: every element must serve a purpose</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: "#d4a032" }}>◆</span>
                      <span>Interactive 3D as focal point, data panels frame the story</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: "#d4a032" }}>◆</span>
                      <span>Real-time telemetry synced with visual feedback</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type CardProps = {
  num: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  color: "amber" | "teal" | "cool" | "warm";
};

const colorMap = {
  amber: "#d4a032",
  teal: "#2dd4bf",
  cool: "#60a5fa",
  warm: "#e8a84a",
};

function SpecCard({ num, title, icon, children, color }: CardProps) {
  const c = colorMap[color];
  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-4 transition-all duration-200 hover:border-white/[0.08]">
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 mb-3">
        <span
          className="text-[10px] font-semibold"
          style={{ color: "#3a3a4a", fontFamily: "JetBrains Mono" }}
        >
          {num}
        </span>
        <span style={{ color: c }}>{icon}</span>
      </div>
      <h4
        className="mb-2 text-xs font-semibold tracking-wider"
        style={{ color: "#e2e2e8", fontFamily: "Chakra Petch" }}
      >
        {title}
      </h4>
      {children}
    </div>
  );
}
