/**
 * Session store — manages weigh-in session data and stats.
 */
import { create } from 'zustand';
import type { Session, SessionStats } from '@/src/types';
import * as sessionsApi from '@/src/services/api/sessions';

interface SessionStore {
  sessions: Session[];
  stats: SessionStats | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;

  /** Load sessions from the API. */
  fetchSessions: () => Promise<void>;
  /** Pull-to-refresh sessions. */
  refreshSessions: () => Promise<void>;
  /** Fetch aggregated stats. */
  fetchStats: () => Promise<void>;
  /** Add a new session (from BLE or manual entry). */
  addSession: (session: Omit<Session, 'id' | 'userId' | 'synced'>) => Promise<void>;
  /** Delete a session. */
  deleteSession: (sessionId: string) => Promise<void>;
  /** Get the most recent session. */
  getLatestSession: () => Session | null;
  /** Get sessions for a specific date (YYYY-MM-DD). */
  getSessionsByDate: (date: string) => Session[];
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  stats: null,
  loading: false,
  refreshing: false,
  error: null,

  fetchSessions: async () => {
    set({ loading: true, error: null });
    try {
      const sessions = await sessionsApi.getSessions();
      // Sort newest first
      sessions.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      set({ sessions, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load sessions';
      set({ loading: false, error: message });
    }
  },

  refreshSessions: async () => {
    set({ refreshing: true });
    try {
      const sessions = await sessionsApi.getSessions();
      sessions.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      set({ sessions, refreshing: false });
    } catch {
      set({ refreshing: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await sessionsApi.getStats();
      set({ stats });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  },

  addSession: async (session) => {
    try {
      const created = await sessionsApi.createSession(session);
      set((state) => ({
        sessions: [created, ...state.sessions],
      }));
      // Refresh stats after adding a session
      get().fetchStats();
    } catch (err) {
      console.error('Failed to add session:', err);
      throw err;
    }
  },

  deleteSession: async (sessionId) => {
    try {
      await sessionsApi.deleteSession(sessionId);
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== sessionId),
      }));
      get().fetchStats();
    } catch (err) {
      console.error('Failed to delete session:', err);
      throw err;
    }
  },

  getLatestSession: () => {
    const { sessions } = get();
    return sessions.length > 0 ? sessions[0] : null;
  },

  getSessionsByDate: (date: string) => {
    const { sessions } = get();
    return sessions.filter(
      (s) => new Date(s.timestamp).toISOString().slice(0, 10) === date,
    );
  },
}));
