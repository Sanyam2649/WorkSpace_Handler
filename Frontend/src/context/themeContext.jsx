// src/context/themeContext.jsx
import React, { createContext, useEffect, useState } from 'react';


export const ThemeContext = createContext(null);

export default function ToggleThemeProvider({ children }) {
  const user = sessionStorage.getItem('user');

  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (user && user.preferences && (user.preferences.theme === 'light' || user.preferences.theme === 'dark')) {
      setTheme(user.preferences.theme);
    } else {
      setTheme('light'); 
    }
    setMounted(true);
  }, [user]);
  
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, mounted]);

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}