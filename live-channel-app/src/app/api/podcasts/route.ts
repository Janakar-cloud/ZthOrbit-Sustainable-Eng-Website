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

export async function GET() {
  try {
    const episodes = await readEpisodes();
    return NextResponse.json(episodes);
  } catch (error) {
    console.error("GET /api/podcasts error", error);
    return NextResponse.json({ error: "Failed to load podcasts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!ADMIN_TOKEN) {
      return NextResponse.json({ error: "Admin token not configured" }, { status: 500 });
    }

    const headerToken = request.headers.get("x-admin-token");
    if (headerToken !== ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Omit<PodcastEpisode, "id">;

    const episodes = await readEpisodes();
    const nextId = episodes.length ? Math.max(...episodes.map((e) => e.id).filter((id): id is number => id !== undefined)) + 1 : 1;

    const newEpisode: PodcastEpisode = {
      id: nextId,
      ...body,
    };

    episodes.push(newEpisode);
    await writeEpisodes(episodes);

    return NextResponse.json(newEpisode, { status: 201 });
  } catch (error) {
    console.error("POST /api/podcasts error", error);
    return NextResponse.json({ error: "Failed to create podcast episode" }, { status: 500 });
  }
}
