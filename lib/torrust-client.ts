import axios, { AxiosInstance } from "axios";
import mockTorrents from "@/data/torrents.json";

export interface TorrentInfo {
  id: number;
  info_hash: string;
  name: string;
  description: string | null;
  size: number;
  created_at: string;
  updated_at: string;
  category: string | null;
  seeders: number;
  leechers: number;
  completed: number;
  tmdb_id: number | null;
  media_type: "movie" | "tv" | null;
  quality: string | null;
  audio_languages: string[];
  subtitle_languages: string[];
  release_group: string | null;
}

export interface TorrentStats {
  seeders: number;
  leechers: number;
  completed: number;
}

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

class TorrustClient {
  private api: AxiosInstance;
  private trackerApi: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_TORRUST_INDEX_URL ||
        "http://localhost:3001/api",
      timeout: 10000,
    });

    this.trackerApi = axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_TORRUST_TRACKER_URL ||
        "http://localhost:7070/api",
      timeout: 10000,
      auth: {
        username: process.env.TORRUST_TRACKER_USERNAME || "admin",
        password: process.env.TORRUST_TRACKER_PASSWORD || "password",
      },
    });
  }

  async getTorrents(
    page = 1,
    limit = 25
  ): Promise<{ torrents: TorrentInfo[]; total: number }> {
    if (USE_MOCK_DATA) {
      const mockData = mockTorrents.torrents.map((torrent) =>
        this.convertMockTorrent(torrent)
      );
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedTorrents = mockData.slice(start, end);

      return {
        torrents: paginatedTorrents,
        total: mockData.length,
      };
    }

    try {
      const response = await this.api.get("/torrents", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching torrents:", error);
      const mockData = mockTorrents.torrents.map((torrent) =>
        this.convertMockTorrent(torrent)
      );
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedTorrents = mockData.slice(start, end);

      return {
        torrents: paginatedTorrents,
        total: mockData.length,
      };
    }
  }

  async getTorrent(id: number): Promise<TorrentInfo> {
    if (USE_MOCK_DATA) {
      const mockTorrent = mockTorrents.torrents.find((t) => t.id === id);
      if (!mockTorrent) {
        throw new Error(`Torrent with ID ${id} not found`);
      }
      return this.convertMockTorrent(mockTorrent);
    }

    try {
      const response = await this.api.get(`/torrents/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching torrent:", error);
      const mockTorrent = mockTorrents.torrents.find((t) => t.id === id);
      if (!mockTorrent) {
        throw new Error(`Torrent with ID ${id} not found`);
      }
      return this.convertMockTorrent(mockTorrent);
    }
  }

  async searchTorrents(
    query: string,
    category?: string,
    mediaType?: string
  ): Promise<TorrentInfo[]> {
    if (USE_MOCK_DATA) {
      const mockData = mockTorrents.torrents
        .filter((t) => {
          const matchesQuery = t.title
            .toLowerCase()
            .includes(query.toLowerCase());
          const matchesType = !mediaType || t.type === mediaType;
          return matchesQuery && matchesType;
        })
        .map((torrent) => this.convertMockTorrent(torrent));

      return mockData;
    }

    try {
      const response = await this.api.get("/torrents/search", {
        params: { query, category, media_type: mediaType },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching torrents:", error);
      const mockData = mockTorrents.torrents
        .filter((t) => {
          const matchesQuery = t.title
            .toLowerCase()
            .includes(query.toLowerCase());
          const matchesType = !mediaType || t.type === mediaType;
          return matchesQuery && matchesType;
        })
        .map((torrent) => this.convertMockTorrent(torrent));

      return mockData;
    }
  }

  async uploadTorrent(formData: FormData): Promise<TorrentInfo> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockId = Math.max(...mockTorrents.torrents.map((t) => t.id)) + 1;
      const mockTorrent = {
        id: mockId,
        info_hash: Array.from(
          { length: 40 },
          () => "0123456789abcdef"[Math.floor(Math.random() * 16)]
        ).join(""),
        name: (formData.get("name") as string) || "Unnamed Torrent",
        description: null,
        size: 1024 * 1024 * 1024,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: null,
        seeders: 0,
        leechers: 0,
        completed: 0,
        tmdb_id: parseInt(formData.get("tmdb_id") as string) || null,
        media_type: (formData.get("media_type") as "movie" | "tv") || null,
        quality: (formData.get("quality") as string) || null,
        audio_languages: formData.get("audio_languages")
          ? JSON.parse(formData.get("audio_languages") as string)
          : [],
        subtitle_languages: formData.get("subtitle_languages")
          ? JSON.parse(formData.get("subtitle_languages") as string)
          : [],
        release_group: (formData.get("release_group") as string) || null,
      };

      return mockTorrent;
    }

    const response = await this.api.post("/torrents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async getTorrentStats(infoHash: string): Promise<TorrentStats> {
    if (USE_MOCK_DATA) {
      const mockTorrent = mockTorrents.torrents.find(
        (t) => t.id.toString() === infoHash
      );
      if (mockTorrent) {
        return {
          seeders: mockTorrent.seeders,
          leechers: mockTorrent.leechers,
          completed: mockTorrent.completed,
        };
      }
      return { seeders: 0, leechers: 0, completed: 0 };
    }

    try {
      const response = await this.trackerApi.get(`/stats/torrent/${infoHash}`);
      return {
        seeders: response.data.seeders,
        leechers: response.data.leechers,
        completed: response.data.completed,
      };
    } catch (error) {
      console.error("Error fetching torrent stats:", error);
      return { seeders: 0, leechers: 0, completed: 0 };
    }
  }

  async login(username: string, password: string): Promise<string> {
    if (USE_MOCK_DATA) {
      if (username === "admin" && password === "admin123") {
        return "mock-token-for-admin-user";
      } else if (username === "user" && password === "user123") {
        return "mock-token-for-regular-user";
      }
      throw new Error("Invalid username or password");
    }

    const response = await this.api.post("/auth/login", { username, password });
    return response.data.token;
  }

  private convertMockTorrent(mockTorrent: any): TorrentInfo {
    let sizeInBytes = 0;
    const sizeStr = mockTorrent.size;
    if (typeof sizeStr === "string") {
      const match = sizeStr.match(/^([\d.]+)\s*([KMGT]iB)$/);
      if (match) {
        const [, value, unit] = match;
        const numValue = parseFloat(value);
        switch (unit) {
          case "KiB":
            sizeInBytes = numValue * 1024;
            break;
          case "MiB":
            sizeInBytes = numValue * 1024 * 1024;
            break;
          case "GiB":
            sizeInBytes = numValue * 1024 * 1024 * 1024;
            break;
          case "TiB":
            sizeInBytes = numValue * 1024 * 1024 * 1024 * 1024;
            break;
        }
      }
    }

    const now = new Date();
    let createdAt = new Date(now);
    const timeAgo = mockTorrent.timeAgo;
    if (typeof timeAgo === "string") {
      if (timeAgo.includes("minute")) {
        const minutes = parseInt(timeAgo);
        createdAt = new Date(now.getTime() - minutes * 60 * 1000);
      } else if (timeAgo.includes("hour")) {
        const hours = parseInt(timeAgo);
        createdAt = new Date(now.getTime() - hours * 60 * 60 * 1000);
      } else if (timeAgo.includes("day")) {
        const days = parseInt(timeAgo);
        createdAt = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      } else if (timeAgo.includes("week")) {
        const weeks = parseInt(timeAgo);
        createdAt = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
      } else if (timeAgo.includes("month")) {
        const months = parseInt(timeAgo);
        createdAt.setMonth(createdAt.getMonth() - months);
      }
    }

    const infoHash =
      mockTorrent.info_hash ||
      Array.from(
        { length: 40 },
        () => "0123456789abcdef"[Math.floor(Math.random() * 16)]
      ).join("");

    return {
      id: mockTorrent.id,
      info_hash: infoHash,
      name: mockTorrent.title,
      description: null,
      size: sizeInBytes || 1024 * 1024 * 100,
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
      category: null,
      seeders: mockTorrent.seeders,
      leechers: mockTorrent.leechers,
      completed: mockTorrent.completed,
      tmdb_id: mockTorrent.tmdbId,
      media_type: mockTorrent.type,
      quality: mockTorrent.quality,
      audio_languages: mockTorrent.audio || [],
      subtitle_languages: mockTorrent.subtitles || [],
      release_group: mockTorrent.releaseGroup,
    };
  }

  async register(username: string, password: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return;
    }

    await this.api.post("/auth/register", { username, password });
  }
}

export const torrustClient = new TorrustClient();
