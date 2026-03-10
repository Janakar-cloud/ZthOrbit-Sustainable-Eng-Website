"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { LiveConfig, PlaylistItem, PodcastEpisode } from "@/types/content";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("admin-token");
}

function setStoredToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("admin-token", token);
}

function toMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");

  const [liveConfig, setLiveConfig] = useState<LiveConfig | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [podcastStatus, setPodcastStatus] = useState<string | null>(null);
  const [playlistStatus, setPlaylistStatus] = useState<string | null>(null);

  // S3 direct-upload state
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = getStoredToken();
    if (stored) {
      setToken(stored);
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [liveRes, podcastRes, playlistRes] = await Promise.all([
          fetch("/api/live"),
          fetch("/api/podcasts"),
          fetch("/api/playlist"),
        ]);

        if (liveRes.ok) {
          setLiveConfig((await liveRes.json()) as LiveConfig);
        }
        if (podcastRes.ok) {
          setEpisodes((await podcastRes.json()) as PodcastEpisode[]);
        }
        if (playlistRes.ok) {
          setPlaylist((await playlistRes.json()) as PlaylistItem[]);
        }
      } catch (error) {
        console.error("Failed to load admin data", error);
      }
    }
    load();
  }, []);

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setStoredToken(tokenInput.trim());
    setToken(tokenInput.trim());
    setTokenInput("");
  }

  async function saveLiveConfig(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || !liveConfig) return;
    setLiveStatus(null);

    try {
      const res = await fetch("/api/live", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
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
    if (!token) return;
    setPodcastStatus(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      title: String(formData.get("title") || ""),
      description: String(formData.get("description") || ""),
      audioUrl: String(formData.get("audioUrl") || ""),
      imageUrl: String(formData.get("imageUrl") || ""),
      publishedAt: new Date().toISOString(),
      duration: String(formData.get("duration") || ""),
    } as Omit<PodcastEpisode, "id">;

    try {
      const res = await fetch("/api/podcasts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
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

  // ── S3 direct upload ──────────────────────────────────────────────────────
  async function uploadToS3(): Promise<string | null> {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !token) return null;

    setUploadProgress(0);
    setPlaylistStatus(null);

    try {
      // 1. Ask the server for a presigned PUT URL
      const urlRes = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });

      if (!urlRes.ok) {
        const data = await urlRes.json();
        throw new Error(data.error || "Failed to get upload URL");
      }

      const { uploadUrl, objectUrl } = (await urlRes.json()) as {
        uploadUrl: string;
        objectUrl: string;
      };

      // 2. Upload directly from the browser to S3 (PUT to presigned URL)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`S3 upload failed: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Network error during S3 upload"));
        xhr.send(file);
      });

      setUploadProgress(100);
      setUploadedUrl(objectUrl);
      return objectUrl;
    } catch (error: unknown) {
      setPlaylistStatus(toMessage(error, "Upload failed."));
      setUploadProgress(null);
      return null;
    }
  }

  // ── Playlist management ───────────────────────────────────────────────────
  async function addPlaylistItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    setPlaylistStatus(null);

    const formData = new FormData(e.currentTarget);
    let videoUrl = String(formData.get("videoUrl") || "");

    // If a file was selected, upload it first
    if (fileInputRef.current?.files?.[0]) {
      const uploaded = await uploadToS3();
      if (!uploaded) return; // error already set
      videoUrl = uploaded;
    }

    if (!videoUrl) {
      setPlaylistStatus("Please provide a video URL or select a file to upload.");
      return;
    }

    const body: Omit<PlaylistItem, "id" | "addedAt"> = {
      title: String(formData.get("title") || ""),
      description: String(formData.get("description") || ""),
      videoUrl,
      thumbnailUrl: String(formData.get("thumbnailUrl") || ""),
      duration: String(formData.get("duration") || ""),
      order: playlist.length,
    };

    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add playlist item");
      }

      const created = (await res.json()) as PlaylistItem;
      setPlaylist((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      e.currentTarget.reset();
      setUploadedUrl("");
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPlaylistStatus("Playlist item added.");
    } catch (error: unknown) {
      setPlaylistStatus(toMessage(error, "Could not add playlist item."));
    }
  }

  async function removePlaylistItem(id: number) {
    if (!token) return;
    try {
      const res = await fetch(`/api/playlist/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete item");
      }
      setPlaylist((prev) => prev.filter((i) => i.id !== id));
    } catch (error: unknown) {
      setPlaylistStatus(toMessage(error, "Could not remove playlist item."));
    }
  }

  async function movePlaylistItem(id: number, direction: "up" | "down") {
    if (!token) return;
    const idx = playlist.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const newOrder = direction === "up" ? playlist[idx].order - 1 : playlist[idx].order + 1;
    try {
      const res = await fetch(`/api/playlist/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ order: newOrder }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reorder item");
      }
      // Refresh the full list so orders are normalised by the server
      const listRes = await fetch("/api/playlist");
      if (listRes.ok) setPlaylist((await listRes.json()) as PlaylistItem[]);
    } catch (error: unknown) {
      setPlaylistStatus(toMessage(error, "Could not reorder playlist item."));
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
            Enter the admin token configured in your environment. This is a
            simple protection layer until full authentication is added.
          </p>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Admin token"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Continue
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6 flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Admin Area</h1>
        <p className="text-slate-600 text-sm max-w-2xl">
          Manage the 24/7 live playlist, update live channel settings, and manage
          podcast episodes. Playlist videos are served from AWS S3 (Mumbai region)
          for fast delivery across India.
        </p>
      </header>

      {/* ── 24/7 Playlist management ──────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold border-b border-slate-200 pb-1">
          24/7 Live Playlist
        </h2>
        <div className="grid gap-6 md:grid-cols-2 items-start">
          {/* Add item form */}
          <div className="space-y-4 rounded-md border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold">Add Playlist Item</h3>
            <p className="text-xs text-slate-500">
              Upload a video directly to AWS S3 (Mumbai) for fast playback, or
              paste an existing S3/public URL. Items play in order, looping 24/7.
            </p>
            <form className="space-y-3" onSubmit={addPlaylistItem}>
              <label className="block text-sm">
                <span className="font-medium">Title *</span>
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
                  rows={2}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Upload video to S3</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="mt-1 block text-sm text-slate-600"
                  onChange={() => setUploadedUrl("")}
                />
                {uploadProgress !== null && uploadProgress < 100 && (
                  <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
                {uploadedUrl && (
                  <p className="mt-1 text-xs text-emerald-600 truncate">
                    ✓ Uploaded: {uploadedUrl}
                  </p>
                )}
              </label>
              <label className="block text-sm">
                <span className="font-medium">
                  — or — paste existing video URL (S3 / public)
                </span>
                <input
                  name="videoUrl"
                  type="url"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="https://your-bucket.s3.ap-south-1.amazonaws.com/..."
                  value={uploadedUrl}
                  onChange={(e) => setUploadedUrl(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Thumbnail URL (optional)</span>
                <input
                  name="thumbnailUrl"
                  type="url"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Duration (e.g. 45:00)</span>
                <input
                  name="duration"
                  type="text"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <button
                type="submit"
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Add to playlist
              </button>
              {playlistStatus && (
                <p className="text-xs text-slate-600 mt-1">{playlistStatus}</p>
              )}
            </form>
          </div>

          {/* Current playlist */}
          <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold">
              Current Playlist ({playlist.length} items)
            </h3>
            {playlist.length === 0 ? (
              <p className="text-xs text-slate-400">No items yet. Add videos above.</p>
            ) : (
              <ol className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {playlist.map((item, idx) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-2 rounded-md border border-slate-100 bg-slate-50 p-2"
                  >
                    <span className="text-xs font-bold text-slate-400 mt-0.5 w-5 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.duration && (
                        <p className="text-xs text-slate-400">{item.duration}</p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        aria-label="Move up"
                        disabled={idx === 0}
                        onClick={() => movePlaylistItem(item.id, "up")}
                        className="rounded px-1 py-0.5 text-xs border border-slate-200 hover:bg-slate-200 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        aria-label="Move down"
                        disabled={idx === playlist.length - 1}
                        onClick={() => movePlaylistItem(item.id, "down")}
                        className="rounded px-1 py-0.5 text-xs border border-slate-200 hover:bg-slate-200 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        aria-label="Remove"
                        onClick={() => removePlaylistItem(item.id)}
                        className="rounded px-1 py-0.5 text-xs border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>

      {/* ── Live channel settings & Podcast management ────────────────────── */}
      <section className="grid gap-8 md:grid-cols-2 items-start">
        {/* Live channel settings */}
        <div className="space-y-4 rounded-md border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Live Channel Settings</h2>
          <p className="text-xs text-slate-500">
            Set an external live stream URL (HLS .m3u8 or embed URL). This is
            used as a fallback when the playlist is empty.
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
            Paste the audio file URL from AWS S3 or another provider.
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
                <li key={ep.id} className="flex justify-between gap-2">
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
