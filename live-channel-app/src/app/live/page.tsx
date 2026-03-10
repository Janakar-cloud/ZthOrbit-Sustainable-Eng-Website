"use client";

import { useEffect, useRef, useState } from "react";
import type { LiveConfig, PlaylistItem } from "@/types/content";

export default function LivePage() {
  const [config, setConfig] = useState<LiveConfig | null>(null);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [liveRes, playlistRes] = await Promise.all([
          fetch("/api/live"),
          fetch("/api/playlist"),
        ]);

        if (!liveRes.ok) throw new Error("Failed to load live stream config");
        const liveData = (await liveRes.json()) as LiveConfig;
        setConfig(liveData);

        if (playlistRes.ok) {
          const items = (await playlistRes.json()) as PlaylistItem[];
          setPlaylist(items);
        }
      } catch (err) {
        console.error(err);
        setError("We could not load the live channel right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Auto-advance to next playlist item when a video ends (24/7 loop)
  function handleVideoEnded() {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  }

  // When current index changes, reload the video element with the new src
  useEffect(() => {
    if (videoRef.current && playlist.length > 0) {
      setAutoplayBlocked(false);
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked; show a visible prompt for the user
        setAutoplayBlocked(true);
      });
    }
  }, [currentIndex, playlist]);

  const currentItem = playlist.length > 0 ? playlist[currentIndex] : null;

  // Decide which player to render:
  //  1. If there are playlist items → native video player (S3 URLs)
  //  2. Else if streamUrl is set → iframe embed (external HLS / embed)
  //  3. Otherwise → "nothing configured" notice
  const usePlaylistPlayer = playlist.length > 0;
  const useIframePlayer = !usePlaylistPlayer && !!config?.streamUrl;

  return (
    <main className="min-h-screen flex flex-col bg-black text-white">
      <header className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Live Sustainable Engineering Channel</h1>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-red-400">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          LIVE 24/7
        </span>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {loading && <p>Loading live stream…</p>}
        {error && !loading && <p className="text-red-300 text-center">{error}</p>}

        {!loading && !error && (
          <>
            <div className="w-full max-w-5xl aspect-video bg-black border border-slate-800 rounded-lg overflow-hidden relative">
              {usePlaylistPlayer && currentItem ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls
                    autoPlay
                    playsInline
                    onEnded={handleVideoEnded}
                    onPlay={() => setAutoplayBlocked(false)}
                  >
                    <source src={currentItem.videoUrl} />
                    Your browser does not support the video tag.
                  </video>
                  {autoplayBlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                      <button
                        onClick={() => {
                          videoRef.current?.play();
                          setAutoplayBlocked(false);
                        }}
                        className="flex flex-col items-center gap-2 text-white"
                        aria-label="Play video"
                      >
                        <span className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 transition-colors">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                        <span className="text-sm">Tap to play</span>
                      </button>
                    </div>
                  )}
                </>
              ) : useIframePlayer ? (
                <iframe
                  src={config!.streamUrl}
                  title={config!.title}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300 text-center px-4">
                  No live content is configured yet. Ask an admin to add playlist items or set a stream URL.
                </div>
              )}
            </div>

            {/* Title / description */}
            <div className="max-w-3xl text-center space-y-2">
              {currentItem ? (
                <>
                  <h2 className="text-2xl font-semibold">{currentItem.title}</h2>
                  {currentItem.description && (
                    <p className="text-slate-300">{currentItem.description}</p>
                  )}
                </>
              ) : config ? (
                <>
                  <h2 className="text-2xl font-semibold">{config.title}</h2>
                  <p className="text-slate-300">{config.description}</p>
                </>
              ) : null}
            </div>

            {/* Playlist queue */}
            {playlist.length > 1 && (
              <div className="w-full max-w-5xl">
                <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Up next
                </h3>
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {playlist.map((item, idx) => (
                    <li key={item.id}>
                      <button
                        className={`w-full text-left rounded-md p-2 text-xs border transition-colors ${
                          idx === currentIndex
                            ? "border-emerald-500 bg-emerald-950 text-emerald-300"
                            : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                        }`}
                        onClick={() => setCurrentIndex(idx)}
                      >
                        <span className="block font-medium truncate">{item.title}</span>
                        {item.duration && (
                          <span className="text-slate-500">{item.duration}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
