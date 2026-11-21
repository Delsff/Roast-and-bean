import { API_URL } from "./api";
import { useAuthStore } from "../store/useAuthStore";

export async function http<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { token, logout } = useAuthStore.getState();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    if (res.status === 401 && token) logout();
    const details = body?.details
      ?.map((d: { message: string }) => d.message)
      .join(", ");
    throw new Error(details || body?.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
