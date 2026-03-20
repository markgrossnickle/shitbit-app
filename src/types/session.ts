/**
 * A single weigh-in session recorded by the ShitBit scale.
 *
 * The scale measures weight when the user sits down, again when they
 * stand up, and computes the delta (what was deposited).
 */
export interface Session {
  id: string;
  userId: string;
  /** Weight measured when user sat down (grams) */
  sitWeight: number;
  /** Weight measured when user stood up (grams) */
  standWeight: number;
  /** Difference: sitWeight - standWeight (grams). Always positive for a real session. */
  delta: number;
  /** ISO 8601 timestamp of when the session was recorded */
  timestamp: string;
  /** Battery level of the device at time of recording (0-100) */
  batteryLevel: number;
  /** Optional user-added note */
  note?: string;
  /** Optional tags for categorization */
  tags?: string[];
  /** Whether this session has been synced to the server */
  synced: boolean;
}

/** Aggregated stats computed from a user's session history. */
export interface SessionStats {
  /** Total number of sessions recorded */
  totalSessions: number;
  /** Lifetime total output in grams */
  lifetimeTotal: number;
  /** Average delta per session in grams */
  averageDelta: number;
  /** Largest single session delta in grams */
  biggestSingle: number;
  /** Current consecutive-day streak */
  currentStreak: number;
  /** Longest consecutive-day streak ever */
  longestStreak: number;
  /** Date of the most recent session (ISO 8601) */
  lastSessionDate: string | null;
}

/** Shape of a session as returned by the API (camelCase, with server fields). */
export interface ApiSession {
  id: string;
  user_id: string;
  sit_weight: number;
  stand_weight: number;
  delta: number;
  timestamp: string;
  battery_level: number;
  note: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

/** Convert an API session to the local Session type. */
export function fromApiSession(api: ApiSession): Session {
  return {
    id: api.id,
    userId: api.user_id,
    sitWeight: api.sit_weight,
    standWeight: api.stand_weight,
    delta: api.delta,
    timestamp: api.timestamp,
    batteryLevel: api.battery_level,
    note: api.note ?? undefined,
    tags: api.tags,
    synced: true,
  };
}
