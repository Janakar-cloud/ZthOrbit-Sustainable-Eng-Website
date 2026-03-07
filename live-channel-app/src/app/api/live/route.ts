import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { LiveConfig } from "@/types/content";

const DATA_PATH = path.join(process.cwd(), "data", "live.json");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

async function readLiveConfig(): Promise<LiveConfig> {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as LiveConfig;
}

async function writeLiveConfig(config: LiveConfig): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(config, null, 2), "utf-8");
}

export async function GET() {
  try {
    const config = await readLiveConfig();

    // Allow overriding streamUrl via env for production
    const streamUrl = process.env.LIVE_STREAM_URL || config.streamUrl;

    return NextResponse.json({ ...config, streamUrl });
  } catch (error) {
    console.error("GET /api/live error", error);
    return NextResponse.json({ error: "Failed to load live stream config" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!ADMIN_TOKEN) {
      return NextResponse.json({ error: "Admin token not configured" }, { status: 500 });
    }

    const headerToken = request.headers.get("x-admin-token");
    if (headerToken !== ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<LiveConfig>;

    const current = await readLiveConfig();
    const updated: LiveConfig = {
      streamUrl: body.streamUrl ?? current.streamUrl,
      title: body.title ?? current.title,
      description: body.description ?? current.description,
    };

    await writeLiveConfig(updated);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/live error", error);
    return NextResponse.json({ error: "Failed to update live stream config" }, { status: 500 });
  }
}
