import React from 'react';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useSettings } from './Settings/SettingsContext';
import { IconButton } from './IconButton';

export const DarkModeToggle: React.FC = () => {
  const settings = useSettings();

  return (
    <IconButton
      onClick={() => settings.setTheme(settings.darkMode ? 'light' : 'dark')}
      title={settings.darkMode ? 'Light mode' : 'Dark mode'}
      icon={settings.darkMode ? faSun : faMoon}
    />
  );
};
