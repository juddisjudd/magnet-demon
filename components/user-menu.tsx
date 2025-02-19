"use client";

import { User, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return (
      <Button variant="ghost" size="icon" asChild>
        <Link href="/login">
          <LogIn className="w-5 h-5" />
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="w-5 h-5 cursor-pointer" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800">
        <DropdownMenuLabel className="text-zinc-400">
          {user.username}
          {user.isAdmin && (
            <span className="ml-2 text-xs text-red-400">(Admin)</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer">
          <Link href="/profile" className="flex w-full">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-zinc-200 focus:bg-zinc-800 focus:text-white cursor-pointer">
          <Link href="/settings" className="flex w-full">
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          className="text-red-500 focus:bg-zinc-800 focus:text-red-400 cursor-pointer"
          onClick={handleLogout}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
