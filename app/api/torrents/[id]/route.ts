import { NextResponse } from "next/server";
import { torrustClient } from "@/lib/torrust-client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const torrent = await torrustClient.getTorrent(parseInt(params.id, 10));
    return NextResponse.json(torrent);
  } catch (error) {
    console.error("Error fetching torrent details:", error);
    return NextResponse.json(
      { error: "Failed to fetch torrent details" },
      { status: 500 }
    );
  }
}
