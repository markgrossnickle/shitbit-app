/**
 * Legacy Colors constant kept for compatibility with template components.
 * New code should import from @/src/theme instead.
 */
import { colors } from '@/src/theme';

export default {
  light: {
    text: colors.textPrimary,
    background: colors.background,
    tint: colors.accent,
    tabIconDefault: colors.tabBarInactive,
    tabIconSelected: colors.tabBarActive,
  },
  dark: {
    text: colors.textPrimary,
    background: colors.background,
    tint: colors.accent,
    tabIconDefault: colors.tabBarInactive,
    tabIconSelected: colors.tabBarActive,
  },
};
