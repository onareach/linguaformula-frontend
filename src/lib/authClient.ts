/**
 * Shared auth client: store JWT for mobile (cross-origin cookie often not sent)
 * and send it in Authorization header so API works on all devices.
 */

const API = process.env.NEXT_PUBLIC_API_URL || '';
const JWT_STORAGE_KEY = 'linguaformula_jwt';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(JWT_STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window !== 'undefined') localStorage.setItem(JWT_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(JWT_STORAGE_KEY);
}

export function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${API}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });
}
