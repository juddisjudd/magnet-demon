import Header from "@/components/header";
import TorrentList from "@/components/torrent-list";
import TorrentCarousel from "@/components/torrent-carousel";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 pb-8">
        <div className="mb-8">
          <TorrentCarousel />
        </div>
        <TorrentList />
      </main>
    </div>
  );
}
