"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Film, Magnet, Tv } from "lucide-react";
import { getTMDbImageUrl, type TMDbItem, getItemTitle } from "@/lib/tmdb";
import Header from "@/components/header";
import { TorrentInfo } from "@/lib/torrust-client";

export default function TorrentPage({ params }: { params: { id: string } }) {
  const [torrent, setTorrent] = useState<TorrentInfo | null>(null);
  const [tmdbDetails, setTmdbDetails] = useState<TMDbItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTorrentDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/torrents/${params.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch torrent: ${response.statusText}`);
        }

        const torrentData = await response.json();
        setTorrent(torrentData);

        if (torrentData.tmdb_id && torrentData.media_type) {
          const tmdbResponse = await fetch(
            `/api/tmdb?id=${torrentData.tmdb_id}&type=${torrentData.media_type}`
          );
          if (tmdbResponse.ok) {
            const tmdbData = await tmdbResponse.json();
            setTmdbDetails(tmdbData);
          }
        }
      } catch (error) {
        console.error("Error fetching torrent details:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load torrent"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTorrentDetails();
  }, [params.id]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
        </div>
      </div>
    );
  }

  if (error || !torrent) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">
            {error || "Torrent not found"}
          </h1>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">
              {torrent.name.split("-")[0]}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          {/* Left Column - Poster and Technical Details */}
          <div className="space-y-6">
            <div className="relative aspect-[2/3] bg-muted rounded-lg overflow-hidden">
              <Image
                src={
                  tmdbDetails?.poster_path
                    ? getTMDbImageUrl(tmdbDetails.poster_path, "w500")
                    : "/placeholder.svg?height=450&width=300"
                }
                alt={tmdbDetails ? getItemTitle(tmdbDetails) : torrent.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="grid gap-4 text-sm">
              <div className="grid grid-cols-2 items-center">
                <span className="text-muted-foreground">Category</span>
                <div className="flex items-center gap-2">
                  {torrent.media_type === "movie" ? (
                    <Film className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Tv className="w-4 h-4 text-red-400" />
                  )}
                  <span className="capitalize">
                    {torrent.media_type || "Unknown"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 items-center">
                <span className="text-muted-foreground">Size</span>
                <span>{formatSize(torrent.size)}</span>
              </div>
              <div className="grid grid-cols-2 items-center">
                <span className="text-muted-foreground">Quality</span>
                <span>{torrent.quality || "Unknown"}</span>
              </div>
              <div className="grid grid-cols-2 items-center">
                <span className="text-muted-foreground">Release Group</span>
                <span className="text-yellow-400">
                  {torrent.release_group || "Unknown"}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center bg-muted p-3 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Seeders</span>
                  <span className="text-green-400 font-medium">
                    {torrent.seeders}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Leechers
                  </span>
                  <span className="text-red-400 font-medium">
                    {torrent.leechers}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Completed
                  </span>
                  <span className="text-muted-foreground font-medium">
                    {torrent.completed}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Info Hash
                  </span>
                  <span
                    className="text-muted-foreground font-medium text-xs truncate max-w-[80px]"
                    title={torrent.info_hash}
                  >
                    {torrent.info_hash.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details and Description */}
          <div className="space-y-6">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = `magnet:?xt=urn:btih:${
                    torrent.info_hash
                  }&dn=${encodeURIComponent(torrent.name)}`;
                }}
              >
                <Magnet className="w-4 h-4 mr-2" />
                Magnet Link
              </Button>
            </div>

            <div className="grid gap-4">
              <h2 className="text-lg font-semibold">Media Information</h2>
              <div className="grid gap-4 text-sm">
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Audio Languages</span>
                  <div className="flex flex-wrap gap-2">
                    {torrent.audio_languages &&
                    torrent.audio_languages.length > 0 ? (
                      torrent.audio_languages.map((lang) => (
                        <Badge key={lang} variant="secondary">
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Unknown</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Subtitles</span>
                  <div className="flex flex-wrap gap-2">
                    {torrent.subtitle_languages &&
                    torrent.subtitle_languages.length > 0 ? (
                      torrent.subtitle_languages.map((lang) => (
                        <Badge key={lang} variant="secondary">
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Released</span>
                  <span>
                    {new Date(torrent.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {tmdbDetails?.overview ||
                  torrent.description ||
                  "No description available."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
