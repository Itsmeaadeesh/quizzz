import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
      className={`inline-flex items-center justify-center gap-2 p-2.5 rounded-full border transition-all duration-200 min-h-[44px] min-w-[44px] ${
        theme === 'dark'
          ? 'bg-brand-dark-surface border-brand-dark-border text-amber-400 hover:bg-brand-dark-card hover:border-brand-blue/50'
          : 'bg-slate-100 border-brand-border text-slate-700 hover:bg-slate-200 hover:text-brand-blue'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
      {showLabel && (
        <span className="text-xs font-medium pr-1.5">
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </span>
      )}
    </button>
  );
};
