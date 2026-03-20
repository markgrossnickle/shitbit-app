/**
 * Friends store — manages friend list and leaderboard data.
 */
import { create } from 'zustand';
import type { Friend, Leaderboard, LeaderboardType } from '@/src/types';
import * as friendsApi from '@/src/services/api/friends';
import * as leaderboardApi from '@/src/services/api/leaderboard';

interface FriendsStore {
  friends: Friend[];
  leaderboards: Partial<Record<LeaderboardType, Leaderboard>>;
  loadingFriends: boolean;
  loadingLeaderboard: boolean;
  error: string | null;

  /** Fetch the friend list. */
  fetchFriends: () => Promise<void>;
  /** Add a friend by username. */
  addFriend: (username: string) => Promise<void>;
  /** Remove a friend. */
  removeFriend: (friendId: string) => Promise<void>;
  /** Fetch a specific leaderboard. */
  fetchLeaderboard: (type: LeaderboardType) => Promise<void>;
  /** Clear error state. */
  clearError: () => void;
}

export const useFriendsStore = create<FriendsStore>((set, get) => ({
  friends: [],
  leaderboards: {},
  loadingFriends: false,
  loadingLeaderboard: false,
  error: null,

  fetchFriends: async () => {
    set({ loadingFriends: true, error: null });
    try {
      const friends = await friendsApi.getFriends();
      set({ friends, loadingFriends: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load friends';
      set({ loadingFriends: false, error: message });
    }
  },

  addFriend: async (username) => {
    set({ error: null });
    try {
      const friend = await friendsApi.addFriend(username);
      set((state) => ({
        friends: [...state.friends, friend],
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add friend';
      set({ error: message });
      throw err;
    }
  },

  removeFriend: async (friendId) => {
    try {
      await friendsApi.removeFriend(friendId);
      set((state) => ({
        friends: state.friends.filter((f) => f.id !== friendId),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove friend';
      set({ error: message });
      throw err;
    }
  },

  fetchLeaderboard: async (type) => {
    set({ loadingLeaderboard: true });
    try {
      const leaderboard = await leaderboardApi.getLeaderboard(type);
      set((state) => ({
        leaderboards: { ...state.leaderboards, [type]: leaderboard },
        loadingLeaderboard: false,
      }));
    } catch (err) {
      console.error(`Failed to fetch ${type} leaderboard:`, err);
      set({ loadingLeaderboard: false });
    }
  },

  clearError: () => set({ error: null }),
}));
