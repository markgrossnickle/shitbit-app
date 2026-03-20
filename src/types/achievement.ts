/** Categories of achievements. */
export type AchievementCategory = 'milestone' | 'streak' | 'social' | 'legendary';

/** Definition of an achievement that can be earned. */
export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  /** The threshold value required to earn this achievement */
  threshold: number;
}

/** An achievement earned by a user. */
export interface Achievement {
  id: string;
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  /** When the achievement was earned (ISO 8601) */
  earnedAt: string;
}

/**
 * All possible achievement IDs.
 * These correspond to the server-side achievement definitions.
 */
export const ACHIEVEMENT_IDS = {
  // Milestones
  FIRST_SESSION: 'first_session',
  TEN_SESSIONS: 'ten_sessions',
  FIFTY_SESSIONS: 'fifty_sessions',
  HUNDRED_SESSIONS: 'hundred_sessions',
  KILO_CLUB: 'kilo_club', // 1kg lifetime total
  FIVE_KILO: 'five_kilo',
  TEN_KILO: 'ten_kilo',

  // Streaks
  THREE_DAY_STREAK: 'three_day_streak',
  SEVEN_DAY_STREAK: 'seven_day_streak',
  THIRTY_DAY_STREAK: 'thirty_day_streak',
  HUNDRED_DAY_STREAK: 'hundred_day_streak',

  // Single session records
  QUARTER_POUNDER: 'quarter_pounder', // 250g+ single session
  HALF_POUNDER: 'half_pounder', // 500g+
  FULL_POUNDER: 'full_pounder', // 750g+
  LEGENDARY: 'legendary', // 1000g+

  // Social
  FIRST_FRIEND: 'first_friend',
  FIVE_FRIENDS: 'five_friends',
  FIRST_SHARE: 'first_share',
  TOP_OF_LEADERBOARD: 'top_of_leaderboard',
} as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[keyof typeof ACHIEVEMENT_IDS];
