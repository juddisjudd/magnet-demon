import { NextResponse } from "next/server";
import { torrustClient } from "@/lib/torrust-client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const torrent = await torrustClient.uploadTorrent(formData);
    return NextResponse.json(torrent);
  } catch (error) {
    console.error("Error uploading torrent:", error);
    return NextResponse.json(
      { error: "Failed to upload torrent" },
      { status: 500 }
    );
  }
}
