"use client";

import { useEffect, useState } from "react";

interface Stat {
  label: string;
  value: string;
}

const stats: Stat[] = [
  { label: "Total Users", value: "10,000+" },
  { label: "Torrents Uploaded", value: "5,000+" },
  { label: "Total Downloads", value: "1M+" },
  { label: "Active Seeders", value: "50,000+" },
  { label: "Completed Downloads", value: "500,000+" },
  { label: "Languages Supported", value: "20+" },
  { label: "Average Seed Ratio", value: "2.5" },
  { label: "Daily Active Users", value: "5,000+" },
  { label: "Total Data Shared", value: "500TB+" },
  { label: "Highest Seeded Torrent", value: "10,000+" },
];

export function Footer() {
  const [randomStats, setRandomStats] = useState<Stat[]>([]);

  useEffect(() => {
    const shuffled = [...stats].sort(() => 0.5 - Math.random());
    setRandomStats(shuffled.slice(0, 3));
  }, []);

  return (
    <footer className="bg-background border-t border-border mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2025 MagnetDemon. All rights reserved.
          </div>
          <div className="flex space-x-8">
            {randomStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-sm font-medium text-primary">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
