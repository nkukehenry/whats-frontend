const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api/v1';

export async function refreshTokenRequest(refreshToken: string) {
  const res = await fetch(`${API_BASE}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error('Failed to refresh token');
  return res.json();
}

// Helper to decode JWT and check expiry
function decodeJwt(token: string): { exp?: number } {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return {};
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  let token = options?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  let refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

  // Proactively refresh if token is expired or about to expire (within 30s)
  if (token) {
    const { exp } = decodeJwt(token);
    if (exp && Date.now() / 1000 > exp - 30 && refreshToken) {
      try {
        const refreshData = await refreshTokenRequest(refreshToken);
        if (refreshData.token) {
          token = refreshData.token;
          localStorage.setItem('token', refreshData.token);
          // On token refresh, only update localStorage, not Redux
          if (refreshData.refreshToken) {
            localStorage.setItem('refreshToken', refreshData.refreshToken);
            // Optionally add setRefreshToken if you want to keep Redux in sync
            // store.dispatch(setRefreshToken(refreshData.refreshToken));
            refreshToken = refreshData.refreshToken;
          }
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          throw new Error('Session expired. Please log in again.');
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        throw new Error('Session expired. Please log in again.');
      }
    }
  }

  const { token: _token, ...fetchOptions } = options || {};
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers || {}),
  };

  let res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  // If unauthorized, try refresh logic (as before)
  if (res.status === 401 || res.status === 403) {
    const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (storedRefreshToken) {
      try {
        const refreshData = await refreshTokenRequest(storedRefreshToken);
        if (refreshData.token) {
          localStorage.setItem('token', refreshData.token);
          // On token refresh, only update localStorage, not Redux
          if (refreshData.refreshToken) {
            localStorage.setItem('refreshToken', refreshData.refreshToken);
            // Optionally add setRefreshToken if you want to keep Redux in sync
            // store.dispatch(setRefreshToken(refreshData.refreshToken));
          }
          const retryHeaders: HeadersInit = {
            ...headers,
            Authorization: `Bearer ${refreshData.token}`
          };
          res = await fetch(`${API_BASE}${endpoint}`, {
            ...fetchOptions,
            headers: retryHeaders,
          });
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          throw new Error('Session expired. Please log in again.');
        }
      } catch (refreshErr) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        throw new Error('Session expired. Please log in again.');
      }
    } else {
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || res.statusText);
  }
  return res.json();
}

export async function fetchPublicPlans() {
  return apiFetch<{ success: boolean; data: unknown[] }>("/subscription-plans/public");
}

export async function subscribeToPlan(planId: number) {
  return apiFetch<{ success: boolean; data: unknown }>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({ planId }),
  });
} 