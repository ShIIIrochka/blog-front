import type { APIError } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class APIClientError extends Error {
  constructor(
    public statusCode: number,
    public detail: string,
    public extra?: Record<string, any>
  ) {
    super(detail);
    this.name = 'APIClientError';
  }
}

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/user/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    // Refresh failed, user needs to login again
    throw new APIClientError(response.status, 'Session expired');
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const finalOptions = { ...defaultOptions, ...options };

  let response = await fetch(url, finalOptions);

  // If we get 401, try to refresh tokens once (but not on auth routes)
  if (response.status === 401 && !path.startsWith('/user/auth/')) {
    // Don't redirect if already on login/register pages
    if (window.location.pathname === '/login' || window.location.pathname === '/register') {
      throw new APIClientError(401, 'Unauthorized');
    }
    
    // If already refreshing, wait for it
    if (isRefreshing && refreshPromise) {
      await refreshPromise;
    } else {
      isRefreshing = true;
      refreshPromise = refreshTokens()
        .catch((error) => {
          // Refresh failed, redirect to login only if not already there
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
          throw error;
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
      
      try {
        await refreshPromise;
        // Retry the original request
        response = await fetch(url, finalOptions);
      } catch (error) {
        // If refresh failed, don't retry the original request
        throw error;
      }
    }
  }

  // Handle non-2xx responses
  if (!response.ok) {
    let error: APIError;
    try {
      error = await response.json();
    } catch {
      error = {
        status_code: response.status,
        detail: response.statusText || 'Unknown error',
      };
    }
    throw new APIClientError(error.status_code, error.detail, error.extra);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  // Parse JSON response
  try {
    return await response.json();
  } catch {
    return undefined as T;
  }
}

