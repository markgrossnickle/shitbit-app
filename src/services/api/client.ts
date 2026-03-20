/**
 * Base API client with auth header injection.
 *
 * Uses fetch (built into React Native) rather than axios to keep
 * the dependency count low. All API modules import this client.
 */
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'shitbit_auth_token';

/** Base URL for the ShitBit API. Update when backend is deployed. */
const BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.shitbit.app';

/** Standard API error with status code and message. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Store the auth token in secure storage. */
export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/** Clear the stored auth token. */
export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/** Get the stored auth token (if any). */
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

/** Configuration for an API request. */
interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  /** If true, skip auth header (for login/register). */
  noAuth?: boolean;
  /** Custom headers to merge in. */
  headers?: Record<string, string>;
}

/**
 * Make an authenticated API request.
 *
 * Automatically injects the stored auth token and handles JSON
 * serialization/deserialization.
 */
export async function apiRequest<T>(config: RequestConfig): Promise<T> {
  const { method, path, body, noAuth, headers: extraHeaders } = config;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...extraHeaders,
  };

  if (!noAuth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      // Body may not be JSON
    }
    const message =
      (errorBody as { message?: string })?.message ??
      `API error: ${response.status} ${response.statusText}`;
    throw new ApiError(response.status, message, errorBody);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
