import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Zap, BarChart3, Home, Settings, Bell } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { id: "energy", label: "Energy", icon: <Zap className="h-5 w-5" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5" /> },
  { id: "home", label: "Home", icon: <Home className="h-6 w-6" /> },
  { id: "alerts", label: "Alerts", icon: <Bell className="h-5 w-5" /> },
  { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

interface FloatingNavProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function FloatingNav({ activeTab, onTabChange }: FloatingNavProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 1 }}
        className="flex items-center gap-2 px-3 py-3 rounded-[32px] min-w-[380px] justify-center"
        style={{
          background: "rgba(10, 12, 20, 0.75)",
          backdropFilter: "blur(60px) saturate(2)",
          WebkitBackdropFilter: "blur(60px) saturate(2)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset",
        }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isCenter = item.id === "home";
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative flex flex-col items-center justify-center transition-all duration-300 group"
              style={{
                width: isCenter ? "72px" : "60px",
                height: isCenter ? "64px" : "56px",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-[24px]"
                  style={{
                    background: isCenter
                      ? "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,245,147,0.1))"
                      : "rgba(255,255,255,0.06)",
                    border: isCenter
                      ? "1px solid rgba(0,212,255,0.2)"
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isCenter ? "0 0 20px rgba(0,212,255,0.1)" : "none",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}

              {/* Active glow */}
              {isCenter && isActive && (
                <div
                  className="absolute inset-0 rounded-full opacity-60"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(0,212,255,0.2), transparent)",
                  }}
                />
              )}

              <div
                className={`relative transition-all duration-300 flex flex-col items-center gap-1.5 ${isActive ? "scale-110" : "scale-100 group-hover:scale-105"}`}
                style={{
                  color: isActive ? (isCenter ? "#00d4ff" : "#e8e8f0") : "#6b6b80",
                }}
              >
                {item.icon}
                <span 
                  className={`text-[9px] font-bold tracking-wider uppercase transition-all duration-300 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                  style={{
                    color: isActive ? (isCenter ? "#00f593" : "#a0a0b8") : "#6b6b80",
                  }}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
