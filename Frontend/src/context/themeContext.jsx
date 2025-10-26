// src/context/themeContext.jsx
import React, { createContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../reducer/thunks/userThunk';

export const ThemeContext = createContext(null);

export default function ToggleThemeProvider({ children }) {
  const dispatch = useDispatch();
  const { value: user } = useSelector((state) => state.user);

  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

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