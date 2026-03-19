import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-9 w-16 cursor-pointer items-center rounded-full bg-secondary p-1 transition-colors duration-300 border border-border hover:border-primary/50 group shadow-sm"
      aria-label="Toggle theme"
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background shadow-md border border-border"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="h-4 w-4 text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0.5, opacity: 0, rotate: 90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="h-4 w-4 text-amber-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="absolute inset-0 flex justify-between px-2 items-center text-[10px] font-bold uppercase tracking-wider opacity-60 pointer-events-none">
        <Moon
          className={`h-3 w-3 ${isDark ? "opacity-0" : "opacity-100"} transition-opacity`}
        />
        <Sun
          className={`h-3 w-3 ${!isDark ? "opacity-0" : "opacity-100"} transition-opacity`}
        />
      </div>
    </button>
  );
};
