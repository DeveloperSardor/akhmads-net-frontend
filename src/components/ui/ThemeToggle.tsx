import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-14" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-9 w-[60px] cursor-pointer items-center rounded-full bg-accent/30 backdrop-blur-md p-1 transition-all duration-500 border border-border/50 hover:border-primary/50 group shadow-inner"
      aria-label="Toggle theme"
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`z-20 flex h-7 w-7 items-center justify-center rounded-full shadow-lg ${
          isDark
            ? "bg-slate-900 border border-slate-700 ml-auto"
            : "bg-white border border-amber-100 mr-auto"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="h-4 w-4 text-primary fill-primary/10" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0.5, opacity: 0, rotate: 45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: -45 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="h-4 w-4 text-amber-500 fill-amber-500/10" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="absolute inset-0 flex justify-between px-2.5 items-center pointer-events-none opacity-40">
        <Sun
          className={`h-3.5 w-3.5 ${isDark ? "text-amber-500" : "opacity-0"} transition-all duration-300`}
        />
        <Moon
          className={`h-3.5 w-3.5 ${!isDark ? "text-primary" : "opacity-0"} transition-all duration-300`}
        />
      </div>
    </button>
  );
};
