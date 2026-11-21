import { http } from "./http";
import { useAuthStore } from "../store/useAuthStore";
import type { User } from "../types/types";

type AuthResponse = { token: string; user: User };

export async function login(email: string, password: string) {
  const data = await http<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  useAuthStore.getState().setSession(data.token, data.user);
}

export async function register(name: string, email: string, password: string) {
  const data = await http<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  useAuthStore.getState().setSession(data.token, data.user);
}
