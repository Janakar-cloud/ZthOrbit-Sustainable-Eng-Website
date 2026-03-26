"use client";

import { useEffect, useRef, useState } from "react";
import type { LiveConfig } from "@/types/content";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export default function LivePage() {
  const [config, setConfig] = useState<LiveConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  useEffect(() => {
    // Attach HLS once we have a stream URL and a video element
    if (!config?.streamUrl || !videoRef.current) return;

    let hlsInstance: any = null;
    const videoEl = videoRef.current;
    const streamUrl = config.streamUrl; // Capture for TypeScript
    setStreamError(null);

    async function setupPlayer() {
      // Native HLS (Safari / iOS)
      if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
        videoEl.src = streamUrl;
        try {
          await videoEl.play();
        } catch (err) {
          console.warn("Autoplay blocked; awaiting user gesture", err);
        }
        return;
      }

      // hls.js for other browsers
      const Hls = (await import("hls.js")).default;
      if (!Hls.isSupported()) {
        setStreamError("Your browser does not support HLS playback.");
        return;
      }

      hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(videoEl);

      hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
        if (data?.fatal) {
          setStreamError("The live stream encountered an error. Please retry.");
          hlsInstance?.destroy();
        }
      });

      try {
        await videoEl.play();
      } catch (err) {
        console.warn("Autoplay blocked; awaiting user gesture", err);
      }
    }

    setupPlayer();

    return () => {
      hlsInstance?.destroy();
      if (videoEl) {
        videoEl.pause();
        videoEl.removeAttribute("src");
      }
    };
  }, [config?.streamUrl]);

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
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  controls
                  playsInline
                  muted
                  autoPlay
                  poster=""
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300 text-center px-4">
                  No live stream URL is configured yet.
                </div>
              )}
            </div>
            {streamError && (
              <p className="text-red-300 text-center text-sm">{streamError}</p>
            )}
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
