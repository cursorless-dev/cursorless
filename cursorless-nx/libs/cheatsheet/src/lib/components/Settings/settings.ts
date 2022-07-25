export type SettingId<T extends readonly SettingOption[]> = T[number]['id'];

export type SettingOption = {
  id: string;
  name: string;
  description?: string;
};

export const MODES = [
  {
    id: 'default',
    name: 'Default',
    description: 'Shows all available commands.',
  },
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Shows limited set of the most common commands.',
  },
  {
    id: 'text',
    name: 'Text',
    description: 'Shows commands useful for editing plain text.',
  },
] as const;

export type Mode = SettingId<typeof MODES>;

export const ORDERS = [
  {
    id: 'alphabetical',
    name: 'Alphabetical',
    description: 'Order alphabetically by spoken form.',
  },
  {
    id: 'functional',
    name: 'Functional',
    description: 'Group commands by function.',
  },
] as const;

export type Order = SettingId<typeof ORDERS>;

export const THEMES = [
  {
    id: 'light',
    name: 'Light',
  },
  {
    id: 'dark',
    name: 'Dark',
  },
  {
    id: 'system',
    name: 'System',
    description: 'Use system color scheme.',
  },
] as const;

export type Theme = SettingId<typeof THEMES>;
