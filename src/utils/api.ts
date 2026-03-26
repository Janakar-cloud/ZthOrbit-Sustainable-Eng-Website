const API_BASE = import.meta.env.VITE_API_BASE || "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE) throw new Error("Missing VITE_API_BASE");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body?.error || body?.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export type AuthTokens = { accessToken: string; refreshToken: string };

export function register(data: { email: string; password: string; name?: string }) {
  return request<{ message: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function verifyEmail(data: { email: string; code: string }) {
  return request<AuthTokens>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function resendVerification(email: string) {
  return request<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function login(data: { email: string; password: string }) {
  return request<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export type LiveConfig = { streamUrl: string; title: string; description: string };

export function getLiveConfig() {
  return request<LiveConfig>("/live/config");
}
