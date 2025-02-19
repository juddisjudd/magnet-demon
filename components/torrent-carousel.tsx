"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  getTMDbImageUrl,
  type TMDbItem,
  getItemTitle as getTMDbItemTitle,
} from "@/lib/tmdb";
import { TorrentInfo } from "@/lib/torrust-client";

const ChevronLeft = dynamic(
  () => import("lucide-react").then((mod) => mod.ChevronLeft),
  { ssr: false }
);
const ChevronRight = dynamic(
  () => import("lucide-react").then((mod) => mod.ChevronRight),
  { ssr: false }
);
const Film = dynamic(() => import("lucide-react").then((mod) => mod.Film), {
  ssr: false,
});
const Tv = dynamic(() => import("lucide-react").then((mod) => mod.Tv), {
  ssr: false,
});

interface CarouselItem {
  torrentId: number;
  type: "movie" | "tv";
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
}

function getItemTitle(item: TMDbItem | CarouselItem): string {
  return "title" in item ? item.title || "" : item.name || "";
}

export default function TorrentCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const fetchPopularTorrents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "/api/torrents?limit=10&sort=seeders&order=desc"
        );
        const data = await response.json();

        if (data?.torrents && Array.isArray(data.torrents)) {
          const tmdbData = await Promise.all(
            data.torrents
              .filter((t: TorrentInfo) => t.tmdb_id)
              .map(async (torrent: TorrentInfo) => {
                try {
                  if (!torrent.tmdb_id || !torrent.media_type) {
                    return null;
                  }

                  const response = await fetch(
                    `/api/tmdb?id=${torrent.tmdb_id}&type=${torrent.media_type}`
                  );
                  if (!response.ok) {
                    console.error(
                      `Failed to fetch TMDB data for torrent ${torrent.id}:`,
                      await response.text()
                    );
                    return null;
                  }
                  const data = await response.json();
                  return {
                    ...data,
                    torrentId: torrent.id,
                    type: torrent.media_type,
                    id: data.id || 0,
                  } as CarouselItem;
                } catch (error) {
                  console.error(
                    `Error fetching TMDB data for torrent ${torrent.id}:`,
                    error
                  );
                  return null;
                }
              })
          );

          const filteredData = tmdbData.filter(Boolean) as CarouselItem[];
          setCarouselItems(filteredData);
        }
      } catch (error) {
        console.error("Error fetching popular torrents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularTorrents();
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -832 : 832;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="relative">
        <h2 className="text-2xl font-semibold mb-4">
          Loading Popular Releases...
        </h2>
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] bg-card rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Popular Releases</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-card hover:bg-accent transition-colors duration-200"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-card hover:bg-accent transition-colors duration-200"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="relative">
        {carouselItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No popular releases found.</p>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {carouselItems.map((item) => (
              <Link
                key={item.id}
                href={`/torrent/${item.torrentId}`}
                className="flex-none w-[200px] snap-start"
              >
                <div className="relative group aspect-[2/3] bg-card rounded-lg overflow-hidden">
                  <Image
                    src={
                      getTMDbImageUrl(item.poster_path, "w500") ||
                      "/placeholder.svg"
                    }
                    alt={getItemTitle(item)}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="200px"
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "/placeholder.svg?height=300&width=200&text=No%20Image";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute top-2 left-2">
                    {item.type === "movie" ? (
                      <Film className="w-5 h-5 text-primary" />
                    ) : (
                      <Tv className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-sm font-medium line-clamp-2 text-primary">
                      {getItemTitle(item)}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
