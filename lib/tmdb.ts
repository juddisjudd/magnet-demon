const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export interface TMDbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  overview: string;
}

export interface TMDbTVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  overview: string;
}

export type TMDbItem = TMDbMovie | TMDbTVShow;

async function fetchTMDb(
  endpoint: string,
  params: Record<string, string> = {}
) {
  const url = new URL(`${TMDB_API_BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", process.env.TMDB_API_KEY || "");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDb API error: ${response.statusText}`);
  }
  return response.json();
}

export async function searchTMDb(
  query: string,
  type: "movie" | "tv"
): Promise<TMDbItem[]> {
  const data = await fetchTMDb("/search/" + type, { query });
  return data.results;
}

export async function getTMDbDetails(
  id: number,
  type: "movie" | "tv"
): Promise<TMDbItem> {
  return await fetchTMDb(`/${type}/${id}`);
}

export function getTMDbImageUrl(
  path: string | null,
  size: "original" | "w500" = "w500"
): string {
  if (!path) {
    return "/placeholder.svg?height=750&width=500&text=No%20Image";
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${TMDB_IMAGE_BASE_URL}/${size}${cleanPath}`;
}

export function getItemTitle(item: TMDbItem): string {
  return "title" in item ? item.title : item.name;
}
