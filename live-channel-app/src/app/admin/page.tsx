"use client";

import { FormEvent, useEffect, useState } from "react";
import type { LiveConfig, PodcastEpisode } from "@/types/content";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";
const TOKEN_KEY = "admin-access-token";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

function toMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState(process.env.ADMIN_EMAIL || "");
  const [password, setPassword] = useState(process.env.ADMIN_PASSWORD || "");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [liveConfig, setLiveConfig] = useState<LiveConfig | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [podcastStatus, setPodcastStatus] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredToken();
    if (stored) {
      setToken(stored);
    }
  }, []);

  useEffect(() => {
    async function load() {
      if (!API_BASE) return;
      try {
        const [liveRes, podcastRes] = await Promise.all([
          fetch(`${API_BASE}/live/config`),
          fetch(`${API_BASE}/podcasts`),
        ]);

        if (liveRes.ok) {
          setLiveConfig((await liveRes.json()) as LiveConfig);
        }
        if (podcastRes.ok) {
          setEpisodes((await podcastRes.json()) as PodcastEpisode[]);
        }
      } catch (error) {
        console.error("Failed to load admin data", error);
      }
    }
    load();
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!API_BASE) {
      setLoginError("API base URL is missing. Set NEXT_PUBLIC_API_BASE.");
      return;
    }
    setLoginError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.accessToken) {
        throw new Error(data.error || "Login failed");
      }
      setStoredToken(data.accessToken);
      setToken(data.accessToken);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setLoginError(toMessage(err, "Login failed"));
    }
  }

  async function saveLiveConfig(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || !liveConfig || !API_BASE) return;
    setLiveStatus(null);

    try {
      const res = await fetch(`${API_BASE}/live/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(liveConfig),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save live config");
      }
      setLiveStatus("Live channel settings saved.");
    } catch (error: unknown) {
      setLiveStatus(toMessage(error, "Could not save live channel settings."));
    }
  }

  async function addPodcast(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || !API_BASE) return;
    setPodcastStatus(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      title: String(formData.get("title") || ""),
      description: String(formData.get("description") || ""),
      audioUrl: String(formData.get("audioUrl") || ""),
      imageUrl: String(formData.get("imageUrl") || ""),
      publishDate: new Date().toISOString(),
      duration: String(formData.get("duration") || ""),
    } as Omit<PodcastEpisode, "id">;

    try {
      const res = await fetch(`${API_BASE}/podcasts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create episode");
      }

      const created = (await res.json()) as PodcastEpisode;
      setEpisodes((prev) => [...prev, created]);
      e.currentTarget.reset();
      setPodcastStatus("New podcast episode added.");
    } catch (error: unknown) {
      setPodcastStatus(toMessage(error, "Could not add podcast episode."));
    }
  }

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 rounded-md border border-slate-200 bg-white p-6"
        >
          <h1 className="text-lg font-semibold">Admin Login</h1>
          <p className="text-sm text-slate-600">
            Sign in with the admin credentials configured in your environment
            to obtain a JWT for protected actions.
          </p>
          {!API_BASE && (
            <div className="rounded bg-amber-100 border border-amber-300 text-amber-900 text-xs p-3">
              Set NEXT_PUBLIC_API_BASE to point to the backend (e.g.
              http://localhost:4000/api/v1).
            </div>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {loginError && <p className="text-xs text-red-600">{loginError}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6 flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Admin Area</h1>
        <p className="text-slate-600 text-sm max-w-2xl">
          Update the live channel settings and manage podcast episodes. All
          changes are saved to the backend service (MongoDB + S3 for media).
        </p>
      </header>

      <section className="grid gap-8 md:grid-cols-2 items-start">
        {/* Live channel settings */}
        <div className="space-y-4 rounded-md border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Live Channel Settings</h2>
          <p className="text-xs text-slate-500">
            Set the live stream URL from your streaming provider (for example:
            an HLS .m3u8 URL or an embed URL). This URL is what viewers see on
            the Live page.
          </p>
          {liveConfig && (
            <form className="space-y-3" onSubmit={saveLiveConfig}>
              <label className="block text-sm">
                <span className="font-medium">Stream URL</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={liveConfig.streamUrl}
                  onChange={(e) =>
                    setLiveConfig({ ...liveConfig, streamUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Title</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={liveConfig.title}
                  onChange={(e) =>
                    setLiveConfig({ ...liveConfig, title: e.target.value })
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Description</span>
                <textarea
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={liveConfig.description}
                  onChange={(e) =>
                    setLiveConfig({ ...liveConfig, description: e.target.value })
                  }
                  rows={4}
                />
              </label>
              <button
                type="submit"
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Save live settings
              </button>
              {liveStatus && (
                <p className="text-xs text-slate-600 mt-1">{liveStatus}</p>
              )}
            </form>
          )}
        </div>

        {/* Podcast management */}
        <div className="space-y-4 rounded-md border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Add Podcast Episode</h2>
          <p className="text-xs text-slate-500">
            For now, paste the audio file URL and an optional image URL from
            where your media is stored (for example: AWS S3 or another
            provider). When your backend storage is ready, this form can be
            updated to upload files directly.
          </p>
          <form className="space-y-3" onSubmit={addPodcast}>
            <label className="block text-sm">
              <span className="font-medium">Title</span>
              <input
                name="title"
                type="text"
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Description</span>
              <textarea
                name="description"
                required
                rows={3}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Audio URL</span>
              <input
                name="audioUrl"
                type="url"
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="https://...mp3"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Image URL (optional)</span>
              <input
                name="imageUrl"
                type="url"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="https://...jpg"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Duration (e.g. 12:34)</span>
              <input
                name="duration"
                type="text"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Add episode
            </button>
            {podcastStatus && (
              <p className="text-xs text-slate-600 mt-1">{podcastStatus}</p>
            )}
          </form>

          <div className="pt-4 border-t border-slate-200 space-y-2">
            <h3 className="text-sm font-semibold">Existing episodes</h3>
            <ul className="space-y-1 text-sm max-h-48 overflow-y-auto pr-1">
              {episodes.map((ep) => (
                <li key={ep._id || ep.id || ep.title} className="flex justify-between gap-2">
                  <span className="truncate">{ep.title}</span>
                  <span className="text-xs text-slate-400">{ep.duration}</span>
                </li>
              ))}
              {!episodes.length && (
                <li className="text-xs text-slate-400">No episodes yet.</li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
