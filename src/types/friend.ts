/** A friend connection between two users. */
export interface Friend {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  /** When the friendship was established */
  since: string;
}

/** A single entry on a leaderboard. */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  /** The value being ranked (total grams, biggest single, etc.) */
  value: number;
  /** Whether this entry is the current user */
  isCurrentUser: boolean;
}

/** The different leaderboard time windows / categories. */
export type LeaderboardType = 'daily' | 'weekly' | 'alltime' | 'biggest';

/** A leaderboard response from the API. */
export interface Leaderboard {
  type: LeaderboardType;
  entries: LeaderboardEntry[];
  /** The current user's rank (may not be in the top entries) */
  currentUserRank: number;
  /** The current user's value */
  currentUserValue: number;
}
