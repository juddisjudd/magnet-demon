import { NextResponse } from "next/server";
import { searchTMDb, getTMDbDetails } from "@/lib/tmdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const type = searchParams.get("type") as "movie" | "tv";
  const id = searchParams.get("id");

  if (id) {
    try {
      const details = await getTMDbDetails(Number(id), type);
      return NextResponse.json(details);
    } catch (error) {
      console.error("Error fetching TMDB details:", error);
      return NextResponse.json(
        { error: "Failed to fetch TMDB details" },
        { status: 500 }
      );
    }
  }

  if (!query || !type) {
    return NextResponse.json(
      { error: "Missing query or type parameter" },
      { status: 400 }
    );
  }

  try {
    const results = await searchTMDb(query, type);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching from TMDB:", error);
    return NextResponse.json(
      { error: "Failed to fetch from TMDB" },
      { status: 500 }
    );
  }
}
