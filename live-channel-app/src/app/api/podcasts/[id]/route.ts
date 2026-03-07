import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { PodcastEpisode } from "@/types/content";

const DATA_PATH = path.join(process.cwd(), "data", "podcasts.json");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

async function readEpisodes(): Promise<PodcastEpisode[]> {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as PodcastEpisode[];
}

async function writeEpisodes(episodes: PodcastEpisode[]): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(episodes, null, 2), "utf-8");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!ADMIN_TOKEN) {
      return NextResponse.json({ error: "Admin token not configured" }, { status: 500 });
    }

    const headerToken = request.headers.get("x-admin-token");
    if (headerToken !== ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = Number(params.id);
    const body = (await request.json()) as Partial<PodcastEpisode>;

    const episodes = await readEpisodes();
    const index = episodes.findIndex((e) => e.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    const updated: PodcastEpisode = { ...episodes[index], ...body, id };
    episodes[index] = updated;

    await writeEpisodes(episodes);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/podcasts/[id] error", error);
    return NextResponse.json({ error: "Failed to update podcast episode" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!ADMIN_TOKEN) {
      return NextResponse.json({ error: "Admin token not configured" }, { status: 500 });
    }

    const headerToken = request.headers.get("x-admin-token");
    if (headerToken !== ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = Number(params.id);
    const episodes = await readEpisodes();
    const remaining = episodes.filter((e) => e.id !== id);

    if (remaining.length === episodes.length) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    await writeEpisodes(remaining);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/podcasts/[id] error", error);
    return NextResponse.json({ error: "Failed to delete podcast episode" }, { status: 500 });
  }
}
