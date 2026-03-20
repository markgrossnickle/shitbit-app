/**
 * Auth API endpoints.
 *
 * These return mock data until the backend is deployed.
 */
import { apiRequest, setToken, clearToken } from './client';
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/src/types';

/** Whether to use mock responses instead of hitting the real API. */
const USE_MOCK = true;

const MOCK_USER: User = {
  id: 'mock-user-001',
  username: 'poopmaster',
  email: 'poop@shitbit.app',
  displayName: 'The Poopmaster',
  avatarUrl: null,
  createdAt: '2026-01-15T08:00:00Z',
};

const MOCK_TOKEN = 'mock-jwt-token-shitbit-dev-12345';

/** Log in with email and password. */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    await setToken(MOCK_TOKEN);
    return { user: MOCK_USER, token: MOCK_TOKEN };
  }

  const response = await apiRequest<AuthResponse>({
    method: 'POST',
    path: '/auth/login',
    body: credentials,
    noAuth: true,
  });
  await setToken(response.token);
  return response;
}

/** Register a new account. */
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1000));
    const user: User = {
      ...MOCK_USER,
      username: credentials.username,
      email: credentials.email,
      displayName: credentials.displayName,
    };
    await setToken(MOCK_TOKEN);
    return { user, token: MOCK_TOKEN };
  }

  const response = await apiRequest<AuthResponse>({
    method: 'POST',
    path: '/auth/register',
    body: credentials,
    noAuth: true,
  });
  await setToken(response.token);
  return response;
}

/** Get the current authenticated user's profile. */
export async function getMe(): Promise<User> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_USER;
  }

  return apiRequest<User>({
    method: 'GET',
    path: '/auth/me',
  });
}

/** Log out -- clears the stored token. */
export async function logout(): Promise<void> {
  await clearToken();
}
