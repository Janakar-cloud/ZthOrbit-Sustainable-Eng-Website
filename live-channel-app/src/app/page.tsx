import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold text-center">
        Sustainable Engineering Live Channel
      </h1>
      <p className="text-center max-w-xl text-slate-600">
        This app powers your live video channel and podcast. Use the links
        below to view the public pages or manage content in the admin area.
      </p>
      <nav className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/live"
          className="rounded-md bg-emerald-600 px-4 py-2 text-white font-semibold"
        >
          Go to Live Channel
        </Link>
        <Link
          href="/podcast"
          className="rounded-md border border-emerald-600 px-4 py-2 text-emerald-700 font-semibold"
        >
          Go to Podcast
        </Link>
        <Link
          href="/admin"
          className="rounded-md border border-slate-400 px-4 py-2 text-slate-800 font-semibold"
        >
          Admin Area
        </Link>
      </nav>
    </main>
  );
}
