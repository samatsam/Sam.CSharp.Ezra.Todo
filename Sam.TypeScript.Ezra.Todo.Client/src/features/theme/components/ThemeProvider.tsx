import React, { useEffect, useState } from 'react';
import { settingsApi } from '../../../core/api/api.ts';
import { Theme } from '../../../shared/types';
import { ThemeContext } from '../hooks/useTheme';

// Provide theme context to the rest of the app
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // If user has visited before, use the theme they saved last time
    const saved = localStorage.getItem('theme') as Theme;
    if (saved === Theme.Light || saved === Theme.Dark) return saved;
    // Use system theme if user is new or has no saved theme (e.g. cleared cookies)
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.Dark : Theme.Light;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme.toLowerCase());
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === Theme.Light ? Theme.Dark : Theme.Light;
    // set theme in current session
    setTheme(newTheme);
    // persist theme to storage
    settingsApi.update({ theme: newTheme }).catch((e) => {
      console.error('Failed to update theme setting', e);
    });
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>;
}
