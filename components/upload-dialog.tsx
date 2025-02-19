"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function UploadDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [title, setTitle] = useState("");
  const [tmdbId, setTmdbId] = useState("");
  const [releaseGroup, setReleaseGroup] = useState("");
  const [resolution, setResolution] = useState("");
  const [audioLanguage, setAudioLanguage] = useState("");
  const [subtitleLanguage, setSubtitleLanguage] = useState("");
  const [torrentFile, setTorrentFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setScreenshots(Array.from(event.target.files));
    }
  };

  const handleTorrentFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      setTorrentFile(event.target.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      setScreenshots(Array.from(event.dataTransfer.files));
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!torrentFile) {
      toast.error("Please select a torrent file");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("torrent_file", torrentFile);
      formData.append("name", title);
      formData.append("media_type", mediaType);

      if (tmdbId) {
        formData.append("tmdb_id", tmdbId);
      }

      if (releaseGroup) {
        formData.append("release_group", releaseGroup);
      }

      if (resolution) {
        formData.append("quality", resolution);
      }

      if (audioLanguage) {
        const languages = audioLanguage.split(",").map((lang) => lang.trim());
        formData.append("audio_languages", JSON.stringify(languages));
      }

      if (subtitleLanguage) {
        const languages = subtitleLanguage
          .split(",")
          .map((lang) => lang.trim());
        formData.append("subtitle_languages", JSON.stringify(languages));
      }

      screenshots.forEach((file, index) => {
        formData.append(`screenshot_${index}`, file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload torrent");
      }

      const data = await response.json();

      toast.success("Torrent uploaded successfully", {
        description: `Your torrent "${title}" has been uploaded.`,
      });

      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error("Error uploading torrent:", error);
      toast.error("Failed to upload torrent", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTorrentFile(null);
    setTitle("");
    setMediaType("movie");
    setTmdbId("");
    setReleaseGroup("");
    setResolution("");
    setAudioLanguage("");
    setSubtitleLanguage("");
    setScreenshots([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Upload className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[826px] bg-zinc-900 text-white">
        <DialogHeader>
          <DialogTitle>Upload Torrent</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="torrentFile" className="text-right">
              Torrent File
            </Label>
            <Input
              id="torrentFile"
              type="file"
              accept=".torrent"
              className="col-span-3"
              onChange={handleTorrentFileChange}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Type</Label>
            <RadioGroup
              defaultValue="movie"
              className="col-span-3 flex gap-4"
              value={mediaType}
              onValueChange={(value) => setMediaType(value as "movie" | "tv")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="movie" id="movie" />
                <Label htmlFor="movie">Movie</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tv" id="tv" />
                <Label htmlFor="tv">Show</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              className="col-span-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tmdbId" className="text-right">
              TMDB ID
            </Label>
            <Input
              id="tmdbId"
              type="number"
              className="col-span-3"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="releaseGroup" className="text-right">
              Release Group
            </Label>
            <Input
              id="releaseGroup"
              className="col-span-3"
              value={releaseGroup}
              onChange={(e) => setReleaseGroup(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="resolution" className="text-right">
              Resolution
            </Label>
            <Select value={resolution} onValueChange={setResolution}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1080p">1080p</SelectItem>
                <SelectItem value="2160p">2160p</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="audioLanguage" className="text-right">
              Audio Language
            </Label>
            <Input
              id="audioLanguage"
              className="col-span-3"
              placeholder="English, Spanish, etc. (comma separated)"
              value={audioLanguage}
              onChange={(e) => setAudioLanguage(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subtitleLanguage" className="text-right">
              Subtitle Language
            </Label>
            <Input
              id="subtitleLanguage"
              className="col-span-3"
              placeholder="English, Spanish, etc. (comma separated)"
              value={subtitleLanguage}
              onChange={(e) => setSubtitleLanguage(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Screenshots</Label>
            <div
              className="col-span-3 border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Input
                id="screenshots"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Label htmlFor="screenshots" className="cursor-pointer">
                Drag and drop screenshots here or click to select files
              </Label>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {screenshots.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button type="submit" className="ml-auto" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
