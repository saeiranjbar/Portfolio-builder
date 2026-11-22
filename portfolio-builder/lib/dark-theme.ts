import type { DarkModeConfig, Theme } from './types';

// Colours used when dark mode is on and the site has no custom dark theme. Accent colours
// (primary, secondary, accent) are kept so buttons and highlights still match the brand.
const DARK_BACKGROUND = '#111418';
const DARK_TEXT = '#f4f4f5';
const DARK_TEXT_SECONDARY = '#a1a1aa';

export function deriveDarkTheme(theme: Theme): Theme {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      background: DARK_BACKGROUND,
      text: DARK_TEXT,
      textSecondary: DARK_TEXT_SECONDARY,
    },
  };
}

// The theme the site should render with, given the dark-mode state. With dark mode off,
// the theme is returned unchanged.
export function resolveTheme(theme: Theme, darkMode?: DarkModeConfig): Theme {
  if (!darkMode?.active) return theme;
  if (darkMode.darkTheme) return darkMode.darkTheme;
  return deriveDarkTheme(theme);
}
