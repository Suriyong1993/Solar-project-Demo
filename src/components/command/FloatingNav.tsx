import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Zap, BarChart3, Home, Settings, Bell } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  ariaLabel: string;
}

const navItems: NavItem[] = [
  { id: "energy", label: "Energy", icon: <Zap className="h-5 w-5" />, ariaLabel: "Open energy flow" },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5" />, ariaLabel: "Open analytics" },
  { id: "home", label: "Home", icon: <Home className="h-6 w-6" />, ariaLabel: "Home dashboard" },
  { id: "alerts", label: "Alerts", icon: <Bell className="h-5 w-5" />, ariaLabel: "Open alerts panel" },
  { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" />, ariaLabel: "Open settings panel" },
];

interface FloatingNavProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function FloatingNav({ activeTab, onTabChange }: FloatingNavProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.nav
        initial={{ y: 80, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
        className="glass rounded-full px-2 py-2 flex items-center gap-1 min-w-[360px] justify-center shadow-2xl"
        role="tablist"
        aria-label="Primary navigation"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isCenter = item.id === "home";
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              role="tab"
              aria-selected={isActive}
              aria-label={item.ariaLabel}
              className={`relative flex flex-col items-center justify-center transition-all duration-200 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${isCenter ? "w-16 h-14" : "w-14 h-12"}`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-[var(--muted)] border border-[var(--border-default)]"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
              <div className={`relative z-10 flex flex-col items-center gap-1 transition-colors duration-200 ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}>
                {item.icon}
                <span className={`text-[10px] font-semibold uppercase tracking-wider transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-0"}`}>
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
}
