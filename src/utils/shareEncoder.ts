/**
 * ShitBit Share Encoder
 *
 * Generates a Wordle-style emoji grid that encodes the magnitude
 * of a weigh session. The grid is 3x3 and uses brown/yellow/green
 * squares to create a visual pattern -- more filled = bigger session.
 *
 * The encoding is visually fun for users but opaque to non-users.
 */
import { format } from 'date-fns';

/** The empty square (unfilled cell). */
const EMPTY = '\u2B1B'; // black large square

/** Filled squares by tier — progresses from brown to gold to green. */
const FILL = {
  low: '\uD83D\uDFEB', // brown square
  mid: '\uD83D\uDFE8', // yellow square
  high: '\uD83D\uDFE9', // green square
  legendary: '\uD83D\uDFEA', // purple square
};

/** The poop emoji for the header. */
const POOP = '\uD83D\uDCA9';

/**
 * Tier thresholds in grams.
 * Each tier adds more filled cells to the 3x3 grid.
 */
const TIERS = [
  { maxGrams: 50, cells: 1, fill: FILL.low },
  { maxGrams: 100, cells: 2, fill: FILL.low },
  { maxGrams: 200, cells: 3, fill: FILL.low },
  { maxGrams: 300, cells: 4, fill: FILL.mid },
  { maxGrams: 400, cells: 5, fill: FILL.mid },
  { maxGrams: 500, cells: 6, fill: FILL.mid },
  { maxGrams: 650, cells: 7, fill: FILL.high },
  { maxGrams: 800, cells: 8, fill: FILL.high },
  { maxGrams: Infinity, cells: 9, fill: FILL.legendary },
] as const;

/**
 * Grid fill patterns for each cell count (1-9).
 * Each pattern is a 9-element array (3x3 grid read left-to-right, top-to-bottom).
 * true = filled, false = empty.
 *
 * The patterns are designed to look aesthetically pleasing as they fill up,
 * growing from the center outward like a splash.
 */
const FILL_PATTERNS: Record<number, boolean[]> = {
  1: [
    false, false, false,
    false, true,  false,
    false, false, false,
  ],
  2: [
    false, false, false,
    false, true,  false,
    false, true,  false,
  ],
  3: [
    false, false, false,
    false, true,  false,
    true,  false, true,
  ],
  4: [
    false, true,  false,
    false, true,  false,
    true,  false, true,
  ],
  5: [
    true,  false, true,
    false, true,  false,
    true,  false, true,
  ],
  6: [
    true,  false, true,
    true,  true,  true,
    true,  false, false,
  ],
  7: [
    true,  true,  true,
    true,  true,  false,
    true,  false, true,
  ],
  8: [
    true,  true,  true,
    true,  true,  true,
    true,  false, true,
  ],
  9: [
    true,  true,  true,
    true,  true,  true,
    true,  true,  true,
  ],
};

/**
 * Get the tier label for a delta.
 */
function getTierLabel(deltaGrams: number): string {
  if (deltaGrams >= 800) return 'LEGENDARY';
  if (deltaGrams >= 650) return 'MASSIVE';
  if (deltaGrams >= 400) return 'SOLID';
  if (deltaGrams >= 200) return 'DECENT';
  return 'LIGHT';
}

/**
 * Encode a session delta into a shareable emoji string.
 *
 * @param deltaGrams - The session delta in grams
 * @param date - The session date (defaults to today)
 * @returns A formatted string ready for sharing
 *
 * @example
 * encodeSession(350)
 * // => "ShitBit 03/19 💩\n🟫⬛🟫\n🟫🟨🟫\n⬛🟨⬛"
 *
 * encodeSession(850)
 * // => "ShitBit 03/19 💩 LEGENDARY\n🟪🟪🟪\n🟪🟪🟪\n🟪🟪🟪"
 */
export function encodeSession(deltaGrams: number, date?: Date): string {
  const sessionDate = date ?? new Date();
  const dateStr = format(sessionDate, 'MM/dd');

  // Find matching tier
  const tier = TIERS.find((t) => deltaGrams <= t.maxGrams) ?? TIERS[TIERS.length - 1];
  const pattern = FILL_PATTERNS[tier.cells];
  const label = getTierLabel(deltaGrams);

  // Build the 3x3 grid
  const rows: string[] = [];
  for (let row = 0; row < 3; row++) {
    const cells: string[] = [];
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      cells.push(pattern[idx] ? tier.fill : EMPTY);
    }
    rows.push(cells.join(''));
  }

  // Header with optional tier label for big sessions
  const headerParts = [`ShitBit ${dateStr} ${POOP}`];
  if (tier.cells >= 7) {
    headerParts.push(label);
  }

  return `${headerParts.join(' ')}\n${rows.join('\n')}`;
}

/**
 * Get a simple text summary of a session for sharing contexts
 * where emoji grids might not render well.
 */
export function encodeSessionText(deltaGrams: number, date?: Date): string {
  const sessionDate = date ?? new Date();
  const dateStr = format(sessionDate, 'MM/dd');
  const label = getTierLabel(deltaGrams);
  const blocks = TIERS.find((t) => deltaGrams <= t.maxGrams)?.cells ?? 9;

  return `ShitBit ${dateStr} - ${label} (${blocks}/9)`;
}

/**
 * Get the tier info for a given delta, useful for UI display.
 */
export function getSessionTier(deltaGrams: number): {
  label: string;
  cells: number;
  color: string;
} {
  const label = getTierLabel(deltaGrams);
  const tier = TIERS.find((t) => deltaGrams <= t.maxGrams) ?? TIERS[TIERS.length - 1];

  const colorMap: Record<string, string> = {
    [FILL.low]: '#8B6914',
    [FILL.mid]: '#FFD700',
    [FILL.high]: '#00C853',
    [FILL.legendary]: '#AA00FF',
  };

  return {
    label,
    cells: tier.cells,
    color: colorMap[tier.fill] ?? '#AA00FF',
  };
}
