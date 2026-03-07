import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { PlaylistItem } from "@/types/content";

const DATA_PATH = path.join(process.cwd(), "data", "playlist.json");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

async function readPlaylist(): Promise<PlaylistItem[]> {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as PlaylistItem[];
}

async function writePlaylist(items: PlaylistItem[]): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2), "utf-8");
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!ADMIN_TOKEN) {
      return NextResponse.json({ error: "Admin token not configured" }, { status: 500 });
    }

    const headerToken = request.headers.get("x-admin-token");
    if (headerToken !== ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const numericId = Number(id);
    const body = (await request.json()) as Partial<PlaylistItem>;

    const items = await readPlaylist();
    const index = items.findIndex((i) => i.id === numericId);

    if (index === -1) {
      return NextResponse.json({ error: "Playlist item not found" }, { status: 404 });
    }

    const updated: PlaylistItem = { ...items[index], ...body, id: numericId };
    items[index] = updated;

    // Normalise orders after any reorder
    items.sort((a, b) => a.order - b.order).forEach((item, idx) => {
      item.order = idx;
    });
    await writePlaylist(items);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/playlist/[id] error", error);
    return NextResponse.json({ error: "Failed to update playlist item" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!ADMIN_TOKEN) {
      return NextResponse.json({ error: "Admin token not configured" }, { status: 500 });
    }

    const headerToken = request.headers.get("x-admin-token");
    if (headerToken !== ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const numericId = Number(id);

    const items = await readPlaylist();
    const remaining = items.filter((i) => i.id !== numericId);

    if (remaining.length === items.length) {
      return NextResponse.json({ error: "Playlist item not found" }, { status: 404 });
    }

    // Re-number orders to stay contiguous
    remaining.sort((a, b) => a.order - b.order).forEach((item, idx) => {
      item.order = idx;
    });
    await writePlaylist(remaining);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/playlist/[id] error", error);
    return NextResponse.json({ error: "Failed to delete playlist item" }, { status: 500 });
  }
}
