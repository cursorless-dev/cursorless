import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ModeConfig } from './ModeConfig';
import { Mode, Order, Theme } from './settings';

export interface SettingsContext {
  darkMode: boolean;
  mode: Mode;
  modeConfig: ModeConfig[Mode];
  order: Order;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  setOrder: React.Dispatch<React.SetStateAction<Order>>;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  theme: Theme;
}

export const SettingsContext = createContext<SettingsContext | null>(null);

export type SettingsProviderProps = {
  children: React.ReactNode;
};

export const SettingsProvider: React.FC<SettingsProviderProps> = (props) => {
  const [mode, setMode] = useLocalStorage<Mode>('mode', 'default');
  const [order, setOrder] = useLocalStorage<Order>('order', 'alphabetical');
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'system');

  const systemDarkMode = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches;

  const darkMode = theme === 'system' ? systemDarkMode : theme === 'dark';

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const modeConfig = ModeConfig[mode];
  const value = {
    darkMode,
    mode,
    modeConfig,
    order,
    setMode,
    setOrder,
    setTheme,
    theme,
  };

  return (
    <SettingsContext.Provider value={value}>
      {props.children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const contextValue = useContext(SettingsContext);
  if (contextValue === null) {
    throw new Error(
      'SettingsContext value is null. Is it being used outside of a provider?'
    );
  }
  return contextValue;
};
