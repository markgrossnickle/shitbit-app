/**
 * ShitBit app color palette.
 *
 * Dark theme with warm accent colors. The vibe is "irreverent but not gross" --
 * dark backgrounds with brown/gold/green accents that nod to the product
 * without being literal about it.
 */

export const colors = {
  // --- Core backgrounds ---
  /** Main app background */
  background: '#0A0A0F',
  /** Card/surface background (slightly lighter) */
  surface: '#141420',
  /** Elevated surface (modals, sheets) */
  surfaceElevated: '#1C1C2E',
  /** Input field backgrounds */
  inputBackground: '#1E1E30',

  // --- Text ---
  /** Primary text (headings, body) */
  textPrimary: '#F5F5F7',
  /** Secondary text (labels, captions) */
  textSecondary: '#9CA3AF',
  /** Tertiary/muted text */
  textMuted: '#6B7280',
  /** Inverse text (on light backgrounds) */
  textInverse: '#0A0A0F',

  // --- Brand accents ---
  /** Primary accent — a warm brown/amber */
  accent: '#C68B2C',
  /** Lighter accent for highlights */
  accentLight: '#E5A836',
  /** Darker accent for pressed states */
  accentDark: '#9A6D1E',

  // --- Tier colors (matching share encoder) ---
  /** Tier: light sessions */
  tierLow: '#8B6914',
  /** Tier: moderate sessions */
  tierMid: '#FFD700',
  /** Tier: heavy sessions */
  tierHigh: '#00C853',
  /** Tier: legendary sessions */
  tierLegendary: '#AA00FF',

  // --- Status colors ---
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // --- BLE status ---
  bleConnected: '#22C55E',
  bleConnecting: '#F59E0B',
  bleDisconnected: '#6B7280',

  // --- Borders and dividers ---
  border: '#2A2A3E',
  borderFocused: '#C68B2C',
  divider: '#1E1E30',

  // --- Tab bar ---
  tabBarBackground: '#0F0F18',
  tabBarActive: '#C68B2C',
  tabBarInactive: '#6B7280',

  // --- Misc ---
  /** Overlay for modals/sheets */
  overlay: 'rgba(0, 0, 0, 0.7)',
  /** Skeleton loader shimmer */
  skeleton: '#1E1E30',
  skeletonHighlight: '#2A2A3E',
} as const;

export type ColorName = keyof typeof colors;
