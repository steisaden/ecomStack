// Simple in-memory auth state manager
// In a production environment, this would be stored in a database or Redis

interface AuthState {
  blocked: boolean;
  retryAfter: number;
  failedAttempts: number;
}

// Initial state
let authState: AuthState = {
  blocked: false,
  retryAfter: 0,
  failedAttempts: 0
};

export function getAuthState(): AuthState {
  return { ...authState };
}

export function updateAuthState(newState: Partial<AuthState>): AuthState {
  authState = { ...authState, ...newState };
  return { ...authState };
}

export function resetAuthState(): AuthState {
  authState = {
    blocked: false,
    retryAfter: 0,
    failedAttempts: 0
  };
  return { ...authState };
}

export function incrementFailedAttempts(): AuthState {
  authState.failedAttempts += 1;
  return { ...authState };
}

export function blockAuth(duration: number): AuthState {
  const retryAfter = Math.floor(Date.now() / 1000) + duration;
  authState = {
    ...authState,
    blocked: true,
    retryAfter
  };
  return { ...authState };
}