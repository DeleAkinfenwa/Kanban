// header button that switches light and dark mode
import { useEffect, useState } from 'react';

// where the chosen theme is saved
const STORAGE_KEY = 'kanban-board:theme';

// saved theme, or the system setting if none
function initialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // storage unavailable: fall back to the system setting
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// moon and sun icons for the button
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4.5" fill="currentColor" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export default function ThemeToggle() {
  const [theme, setTheme] = useState(initialTheme);

  // apply the theme to the page and remember it
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // storage unavailable: theme still applies for this visit
    }
  }, [theme]);

  // theme the button switches to
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => {
        // fade colors between themes instead of switching instantly
        const root = document.documentElement;
        root.classList.add('theme-switching');
        clearTimeout(window.__themeFadeTimer);
        window.__themeFadeTimer = setTimeout(() => root.classList.remove('theme-switching'), 1300);
        setTheme(next);
      }}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
