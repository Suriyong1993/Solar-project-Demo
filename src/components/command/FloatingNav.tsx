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
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 1 }}
        className="flex items-center gap-1 px-2 py-2 rounded-[28px] min-w-[320px]"
        style={{
          background: "rgba(11, 13, 22, 0.7)",
          backdropFilter: "blur(60px) saturate(1.6)",
          WebkitBackdropFilter: "blur(60px) saturate(1.6)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset",
        }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isCenter = item.id === "home";
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative flex items-center justify-center transition-all duration-300"
              style={{
                width: isCenter ? "56px" : "48px",
                height: isCenter ? "40px" : "36px",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-1 rounded-[20px]"
                  style={{
                    background: isCenter
                      ? "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,245,147,0.15))"
                      : "rgba(255,255,255,0.06)",
                    border: isCenter
                      ? "1px solid rgba(0,212,255,0.15)"
                      : "1px solid rgba(255,255,255,0.06)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Active glow */}
              {isCenter && isActive && (
                <div
                  className="absolute inset-0 rounded-full opacity-60"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(0,212,255,0.15), transparent)",
                  }}
                />
              )}

              <div
                className="relative transition-colors duration-300"
                style={{
                  color: isActive ? (isCenter ? "#00d4ff" : "#e8e8f0") : "#6b6b80",
                }}
              >
                {item.icon}
              </div>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
