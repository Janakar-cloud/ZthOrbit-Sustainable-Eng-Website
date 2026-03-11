"use client";

import { useEffect, useState } from "react";
import type { PodcastEpisode } from "@/types/content";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export default function PodcastPage() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<PodcastEpisode | null>(null);

  useEffect(() => {
    async function load() {
      if (!API_BASE) {
        setError("API base URL missing. Set NEXT_PUBLIC_API_BASE in env.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/podcasts`);
        if (!res.ok) {
          throw new Error("Failed to load podcasts");
        }
        const data = (await res.json()) as PodcastEpisode[];
        setEpisodes(data);
        if (data.length) {
          setCurrent(data[0]);
        }
      } catch (err) {
        console.error(err);
        setError("We could not load podcast episodes right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6 flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Sustainable Engineering Podcast</h1>
        <p className="text-slate-600 max-w-2xl">
          Listen to conversations on sustainability, technology, leadership, and impact.
        </p>
      </header>

      {loading && <p>Loading episodes…</p>}
      {error && !loading && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <section className="space-y-4">
            <h2 className="font-semibold">Episodes</h2>
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
              {episodes.map((ep) => (
                <button
                  key={ep._id || ep.id || ep.title}
                  onClick={() => setCurrent(ep)}
                  className={`w-full text-left rounded-md border px-3 py-2 text-sm transition-colors ${
                    current?._id === ep._id || current?.id === ep.id
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="font-semibold">{ep.title}</div>
                  <div className="text-xs text-slate-500 line-clamp-2">{ep.description}</div>
                  <div className="mt-1 text-[11px] text-slate-400 flex gap-2">
                    <span>{ep.publishedAt ? new Date(ep.publishedAt).toLocaleDateString() : ""}</span>
                    <span>•</span>
                    <span>{ep.duration}</span>
                  </div>
                </button>
              ))}
              {!episodes.length && <p className="text-sm text-slate-500">No episodes yet.</p>}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-semibold">Now Playing</h2>
            {current ? (
              <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-md bg-slate-100">
                  {/* Image is optional; we render a simple placeholder if missing */}
                  {current.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={current.imageUrl}
                      alt={current.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                      Podcast cover
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{current.title}</h3>
                  <p className="text-sm text-slate-600">{current.description}</p>
                  <audio
                    controls
                    className="w-full mt-2"
                    src={current.audioUrl}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select an episode to start listening.</p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
