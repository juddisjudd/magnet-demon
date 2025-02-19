"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import { TorrentInfo } from "@/lib/torrust-client";

const Search = dynamic(() => import("lucide-react").then((mod) => mod.Search), {
  ssr: false,
});
const ChevronDown = dynamic(
  () => import("lucide-react").then((mod) => mod.ChevronDown),
  { ssr: false }
);
const Film = dynamic(() => import("lucide-react").then((mod) => mod.Film), {
  ssr: false,
});
const Clock = dynamic(() => import("lucide-react").then((mod) => mod.Clock), {
  ssr: false,
});
const ArrowUpNarrowWide = dynamic(
  () => import("lucide-react").then((mod) => mod.ArrowUpNarrowWide),
  { ssr: false }
);
const ArrowDownWideNarrow = dynamic(
  () => import("lucide-react").then((mod) => mod.ArrowDownWideNarrow),
  { ssr: false }
);
const Tv = dynamic(() => import("lucide-react").then((mod) => mod.Tv), {
  ssr: false,
});
const Magnet = dynamic(() => import("lucide-react").then((mod) => mod.Magnet), {
  ssr: false,
});

type SortField = "seeders" | "leechers" | "completed";
type SortOrder = "asc" | "desc";

const ITEMS_PER_PAGE = 25;

export default function TorrentList() {
  const [torrents, setTorrents] = useState<TorrentInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [qualityFilter, setQualityFilter] = useState<string[]>([]);
  const [audioFilter, setAudioFilter] = useState<string[]>([]);
  const [subtitleFilter, setSubtitleFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("seeders");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [torrentTypeFilter, setTorrentTypeFilter] = useState<
    ("all" | "movie" | "tv")[]
  >(["all"]);
  const [isMounted, setIsMounted] = useState(false);
  const [audioLanguages, setAudioLanguages] = useState<string[]>([]);
  const [subtitleLanguages, setSubtitleLanguages] = useState<string[]>([]);

  const fetchTorrents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/torrents?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
      );
      const data = await response.json();

      if (data.torrents) {
        setTorrents(data.torrents);
        setTotal(data.total);

        const audioLangs = new Set<string>();
        const subLangs = new Set<string>();

        data.torrents.forEach((torrent: TorrentInfo) => {
          torrent.audio_languages.forEach((lang) => audioLangs.add(lang));
          torrent.subtitle_languages.forEach((lang) => subLangs.add(lang));
        });

        setAudioLanguages(Array.from(audioLangs));
        setSubtitleLanguages(Array.from(subLangs));
      }
    } catch (error) {
      console.error("Failed to fetch torrents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchTorrents = async () => {
    if (!searchTerm) {
      fetchTorrents();
      return;
    }

    setIsLoading(true);
    try {
      let mediaType: string | undefined = undefined;
      if (!torrentTypeFilter.includes("all")) {
        if (
          torrentTypeFilter.includes("movie") &&
          !torrentTypeFilter.includes("tv")
        ) {
          mediaType = "movie";
        } else if (
          torrentTypeFilter.includes("tv") &&
          !torrentTypeFilter.includes("movie")
        ) {
          mediaType = "tv";
        }
      }

      const response = await fetch(
        `/api/torrents?query=${encodeURIComponent(searchTerm)}${
          mediaType ? `&mediaType=${mediaType}` : ""
        }`
      );
      const data = await response.json();
      setTorrents(data);
      setTotal(data.length);
    } catch (error) {
      console.error("Failed to search torrents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (searchTerm) {
        searchTorrents();
      } else {
        fetchTorrents();
      }
    }
  }, [isMounted, currentPage, torrentTypeFilter]);

  const formatSize = (bytes: number): string => {
    const units = ["B", "KiB", "MiB", "GiB", "TiB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return `${diffSec} seconds ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;

    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;

    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;

    const diffMonth = Math.floor(diffDay / 30);
    if (diffMonth < 12)
      return `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;

    const diffYear = Math.floor(diffMonth / 12);
    return `${diffYear} year${diffYear > 1 ? "s" : ""} ago`;
  };

  const filteredTorrents = torrents.filter(
    (torrent) =>
      (qualityFilter.length === 0 ||
        (torrent.quality && qualityFilter.includes(torrent.quality))) &&
      (audioFilter.length === 0 ||
        audioFilter.some((lang) => torrent.audio_languages.includes(lang))) &&
      (subtitleFilter.length === 0 ||
        subtitleFilter.some((lang) =>
          torrent.subtitle_languages.includes(lang)
        )) &&
      (torrentTypeFilter.includes("all") ||
        (torrent.media_type &&
          torrentTypeFilter.includes(torrent.media_type as "movie" | "tv")))
  );

  const sortedTorrents = filteredTorrents.sort((a, b) => {
    if (sortOrder === "asc") {
      return a[sortField] - b[sortField];
    } else {
      return b[sortField] - a[sortField];
    }
  });

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTorrentTypeChange = (type: "all" | "movie" | "tv") => {
    setTorrentTypeFilter((prev) => {
      if (type === "all") {
        return ["all"];
      } else {
        const newFilter = prev.filter((t) => t !== "all");
        if (newFilter.includes(type)) {
          return newFilter.filter((t) => t !== type);
        } else {
          return [...newFilter, type];
        }
      }
    });
    setCurrentPage(1);
  };

  const handleSearch = () => {
    searchTorrents();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search torrents..."
            className="w-full p-2 pl-10 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <Search
            className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground cursor-pointer"
            onClick={handleSearch}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-background border-input hover:bg-accent transition-colors duration-200"
            >
              Quality
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-popover border-input">
            {["1080p", "2160p"].map((quality) => (
              <DropdownMenuCheckboxItem
                key={quality}
                checked={qualityFilter.includes(quality)}
                onCheckedChange={(checked) => {
                  setQualityFilter(
                    checked
                      ? [...qualityFilter, quality]
                      : qualityFilter.filter((q) => q !== quality)
                  );
                }}
                className="text-popover-foreground"
              >
                {quality}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-background border-input hover:bg-accent transition-colors duration-200"
            >
              Audio
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-popover border-input">
            {audioLanguages.map((lang) => (
              <DropdownMenuCheckboxItem
                key={lang}
                checked={audioFilter.includes(lang)}
                onCheckedChange={(checked) => {
                  setAudioFilter(
                    checked
                      ? [...audioFilter, lang]
                      : audioFilter.filter((l) => l !== lang)
                  );
                }}
                className="text-popover-foreground"
              >
                {lang}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-background border-input hover:bg-accent transition-colors duration-200"
            >
              Subtitles
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-popover border-input">
            {subtitleLanguages.map((lang) => (
              <DropdownMenuCheckboxItem
                key={lang}
                checked={subtitleFilter.includes(lang)}
                onCheckedChange={(checked) => {
                  setSubtitleFilter(
                    checked
                      ? [...subtitleFilter, lang]
                      : subtitleFilter.filter((l) => l !== lang)
                  );
                }}
                className="text-popover-foreground"
              >
                {lang}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-all"
              checked={torrentTypeFilter.includes("all")}
              onCheckedChange={() => handleTorrentTypeChange("all")}
            />
            <label
              htmlFor="filter-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              All
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-movies"
              checked={torrentTypeFilter.includes("movie")}
              onCheckedChange={() => handleTorrentTypeChange("movie")}
            />
            <label
              htmlFor="filter-movies"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Movies
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-tv"
              checked={torrentTypeFilter.includes("tv")}
              onCheckedChange={() => handleTorrentTypeChange("tv")}
            />
            <label
              htmlFor="filter-tv"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              TV Shows
            </label>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
        </div>
      ) : sortedTorrents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No torrents found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="bg-card rounded overflow-hidden">
          <div className="grid grid-cols-[auto_auto_1fr_auto_auto_auto] items-center px-4 py-2 bg-muted font-semibold text-sm">
            <div className="w-5">
              <Film className="w-5 h-5 invisible" />
            </div>
            <div className="w-5">
              <Magnet className="w-5 h-5 invisible" />
            </div>
            <div className="px-2">
              Title (
              {torrentTypeFilter.includes("all")
                ? "All"
                : torrentTypeFilter.join(" & ")}
              )
            </div>
            <div className="text-right min-w-[120px]">When?</div>
            <div className="text-right min-w-[100px] px-4">Size</div>
            <div className="grid grid-cols-3 gap-4 text-sm min-w-[120px] text-center">
              <button
                className="flex items-center justify-center gap-1"
                onClick={() => handleSort("seeders")}
              >
                S
                {sortField === "seeders" &&
                  (sortOrder === "asc" ? (
                    <ArrowUpNarrowWide className="w-4 h-4" />
                  ) : (
                    <ArrowDownWideNarrow className="w-4 h-4" />
                  ))}
              </button>
              <button
                className="flex items-center justify-center gap-1"
                onClick={() => handleSort("leechers")}
              >
                L
                {sortField === "leechers" &&
                  (sortOrder === "asc" ? (
                    <ArrowUpNarrowWide className="w-4 h-4" />
                  ) : (
                    <ArrowDownWideNarrow className="w-4 h-4" />
                  ))}
              </button>
              <button
                className="flex items-center justify-center gap-1"
                onClick={() => handleSort("completed")}
              >
                C
                {sortField === "completed" &&
                  (sortOrder === "asc" ? (
                    <ArrowUpNarrowWide className="w-4 h-4" />
                  ) : (
                    <ArrowDownWideNarrow className="w-4 h-4" />
                  ))}
              </button>
            </div>
          </div>

          {sortedTorrents.map((torrent) => (
            <Link
              href={`/torrent/${torrent.id}`}
              key={torrent.id}
              className="grid grid-cols-[auto_auto_1fr_auto_auto_auto] items-center px-4 py-2 hover:bg-accent transition-colors duration-200"
            >
              <div className="flex items-center justify-center w-5">
                {torrent.media_type === "movie" ? (
                  <Film className="w-5 h-5 text-blue-400" />
                ) : (
                  <Tv className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="flex items-center justify-center w-5">
                <Magnet
                  className="w-5 h-5 text-zinc-400 hover:text-primary cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `magnet:?xt=urn:btih:${torrent.info_hash}`;
                  }}
                />
              </div>
              <div className="font-mono text-sm text-zinc-100 truncate px-2">
                {torrent.name}
                {torrent.release_group && (
                  <>
                    -
                    <span className="text-yellow-400">
                      {torrent.release_group}
                    </span>
                  </>
                )}
              </div>
              <div className="text-sm text-zinc-400 flex items-center justify-end gap-2 min-w-[120px]">
                <Clock className="w-4 h-4" />
                <span>{formatTimeAgo(torrent.created_at)}</span>
              </div>
              <div className="text-sm text-zinc-400 min-w-[100px] px-4 text-right">
                {formatSize(torrent.size)}
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm min-w-[120px] text-center">
                <span className="text-green-400">{torrent.seeders}</span>
                <span className="text-red-400">{torrent.leechers}</span>
                <span className="text-zinc-400">{torrent.completed}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className={`bg-zinc-800 text-zinc-200 hover:bg-zinc-700 ${
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }`}
            />
          </PaginationItem>
          {[...Array(Math.min(5, totalPages))].map((_, index) => {
            let pageNum = currentPage;
            if (totalPages <= 5) {
              pageNum = index + 1;
            } else if (currentPage <= 3) {
              pageNum = index + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + index;
            } else {
              pageNum = currentPage - 2 + index;
            }

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => handlePageChange(pageNum)}
                  isActive={currentPage === pageNum}
                  className={
                    currentPage === pageNum
                      ? "bg-red-700 text-white"
                      : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                  }
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              className={`bg-zinc-800 text-zinc-200 hover:bg-zinc-700 ${
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
