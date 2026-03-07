import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { PlaylistItem } from "@/types/content";

const DATA_PATH = path.join(process.cwd(), "data", "playlist.json");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

async function readPlaylist(): Promise<PlaylistItem[]> {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const items = JSON.parse(raw) as PlaylistItem[];
  return items.sort((a, b) => a.order - b.order);
}

async function writePlaylist(items: PlaylistItem[]): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2), "utf-8");
}

export async function GET() {
  try {
    const items = await readPlaylist();
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/playlist error", error);
    return NextResponse.json({ error: "Failed to load playlist" }, { status: 500 });
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

    const body = (await request.json()) as Omit<PlaylistItem, "id" | "addedAt">;

    const items = await readPlaylist();
    const nextId = items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const nextOrder = items.length ? Math.max(...items.map((i) => i.order)) + 1 : 0;

    const newItem: PlaylistItem = {
      id: nextId,
      title: body.title,
      description: body.description ?? "",
      videoUrl: body.videoUrl,
      thumbnailUrl: body.thumbnailUrl ?? "",
      duration: body.duration ?? "",
      order: body.order ?? nextOrder,
      addedAt: new Date().toISOString(),
    };

    items.push(newItem);
    // Normalise orders to be contiguous
    items.sort((a, b) => a.order - b.order).forEach((item, idx) => {
      item.order = idx;
    });
    await writePlaylist(items);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("POST /api/playlist error", error);
    return NextResponse.json({ error: "Failed to add playlist item" }, { status: 500 });
  }
}
