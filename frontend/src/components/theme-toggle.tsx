"use client";

import { useTheme } from "@/providers/theme-provider";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <Button
      aria-label="Alternar tema"
      className="glass-toggle gap-2 rounded-full px-3"
      variant="secondary"
      onClick={toggleTheme}
    >
      <span aria-hidden="true" className="theme-icon theme-icon--moon">
        ☾
      </span>
      <span aria-hidden="true" className="theme-icon theme-icon--sun">
        ☀
      </span>
    </Button>
  );
}
