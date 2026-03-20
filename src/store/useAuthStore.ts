/**
 * Auth store — manages user authentication state.
 */
import { create } from 'zustand';
import type { User, LoginCredentials, RegisterCredentials } from '@/src/types';
import * as authApi from '@/src/services/api/auth';
import { getToken } from '@/src/services/api/client';

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;

  /** Check for an existing token and load user profile. Call on app start. */
  initialize: () => Promise<void>;
  /** Log in with email/password. */
  login: (credentials: LoginCredentials) => Promise<void>;
  /** Register a new account. */
  register: (credentials: RegisterCredentials) => Promise<void>;
  /** Log out and clear stored credentials. */
  logout: () => Promise<void>;
  /** Clear any displayed error. */
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    try {
      const token = await getToken();
      if (token) {
        set({ loading: true });
        const user = await authApi.getMe();
        set({ user, token, loading: false, initialized: true });
      } else {
        set({ initialized: true });
      }
    } catch {
      // Token was invalid or expired
      await authApi.logout();
      set({ user: null, token: null, loading: false, initialized: true });
    }
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await authApi.login(credentials);
      set({ user, token, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ loading: false, error: message });
      throw err;
    }
  },

  register: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await authApi.register(credentials);
      set({ user, token, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      set({ loading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));
