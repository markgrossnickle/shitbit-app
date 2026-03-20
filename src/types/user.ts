/** A ShitBit user profile. */
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
}

/** Authentication state stored on-device. */
export interface AuthState {
  /** The authenticated user, or null if logged out */
  user: User | null;
  /** JWT access token */
  token: string | null;
  /** Whether an auth operation is in progress */
  loading: boolean;
  /** Most recent auth error message */
  error: string | null;
  /** Whether the initial auth check has completed */
  initialized: boolean;
}

/** Credentials for email/password login. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Credentials for registration. */
export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  displayName: string;
}

/** Shape of auth API responses. */
export interface AuthResponse {
  user: User;
  token: string;
}
