import { useTheme as useThemeFromContext } from '../ThemeContext';

export function useTheme() {
  return useThemeFromContext();
}
