"use client";

import { useEffect, useState } from "react";
import type { LiveConfig } from "@/types/content";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export default function LivePage() {
  const [config, setConfig] = useState<LiveConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!API_BASE) {
        setError("API base URL missing. Set NEXT_PUBLIC_API_BASE in env.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/live/config`);
        if (!res.ok) {
          throw new Error("Failed to load live stream");
        }
        const data = (await res.json()) as LiveConfig;
        setConfig(data);
      } catch (err) {
        console.error(err);
        setError("We could not load the live channel right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-black text-white">
      <header className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Live Sustainable Engineering Channel</h1>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-red-400">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          LIVE
        </span>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {loading && <p>Loading live stream…</p>}
        {error && !loading && <p className="text-red-300 text-center">{error}</p>}
        {!loading && !error && config && (
          <>
            <div className="w-full max-w-5xl aspect-video bg-black border border-slate-800 rounded-lg overflow-hidden">
              {config.streamUrl ? (
                <iframe
                  src={config.streamUrl}
                  title={config.title}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300 text-center px-4">
                  No live stream URL is configured yet.
                </div>
              )}
            </div>
            <div className="max-w-3xl text-center space-y-2">
              <h2 className="text-2xl font-semibold">{config.title}</h2>
              <p className="text-slate-300">{config.description}</p>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
