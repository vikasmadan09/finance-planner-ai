// src/components/ThemeToggle.tsx
import { useTheme } from "../context/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="cursor-pointer" onClick={toggleTheme}>
      {theme === "dark" ? (
        <SunIcon className="h-7 w-7 inline text-yellow-400" />
      ) : (
        <MoonIcon className="h-7 w-7 inline text-[var(--text-900)] " /> // Or text-gray-800 for a darker moon
      )}
    </button>
  );
}
