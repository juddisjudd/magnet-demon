import { NextResponse } from "next/server";
import { torrustClient } from "@/lib/torrust-client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "25", 10);
  const query = searchParams.get("query");
  const category = searchParams.get("category");
  const mediaType = searchParams.get("mediaType");

  try {
    if (query) {
      const torrents = await torrustClient.searchTorrents(
        query,
        category || undefined,
        mediaType || undefined
      );
      return NextResponse.json(torrents);
    }

    const { torrents, total } = await torrustClient.getTorrents(page, limit);
    return NextResponse.json({ torrents, total, page, limit });
  } catch (error) {
    console.error("Error fetching torrents:", error);
    return NextResponse.json(
      { error: "Failed to fetch torrents" },
      { status: 500 }
    );
  }
}
