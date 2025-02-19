"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Copy, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsContent() {
  const [rssKey, setRssKey] = useState("abc123def456ghi789");
  const [apiKey, setApiKey] = useState("xyz987uvw654rst321");

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} Copied`, {
      description: `${type} has been copied to clipboard.`,
    });
  };

  const rerollKey = (type: "rss" | "api") => {
    const newKey =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    if (type === "rss") {
      setRssKey(newKey);
    } else {
      setApiKey(newKey);
    }
    toast.success(`${type.toUpperCase()} Key Re-rolled`, {
      description: `New ${type.toUpperCase()} key generated.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>RSS Key</CardTitle>
            <CardDescription>Your RSS key for feed access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                value={rssKey}
                readOnly
                className="bg-zinc-800 text-zinc-300"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(rssKey, "RSS Key")}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => rerollKey("rss")}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>API Key</CardTitle>
            <CardDescription>
              Your API key for programmatic access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                value={apiKey}
                readOnly
                className="bg-zinc-800 text-zinc-300"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(apiKey, "API Key")}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => rerollKey("api")}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Delete Profile</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Profile
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
