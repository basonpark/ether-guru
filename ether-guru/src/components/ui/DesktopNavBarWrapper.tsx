// src/components/ui/DesktopNavBarWrapper.tsx
"use client";

import React from "react";
import { NavBar } from "./tubelight-navbar";
import { Home, Info, Code, Trophy } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";
import Image from "next/image"; 
import UserProfile from "../auth/UserProfile";

// Define navItems inside the Client Component
const navItems = [
  {
    name: "EtherGuru",
    url: "/",
    icon: Home,
  },
  {
    name: "About",
    url: "/about",
    icon: Info,
  },
  {
    name: "Solidity",
    url: "/solidity",
    icon: Code,
  },
  {
    name: "Hackathons",
    url: "/hackathons",
    icon: Trophy,
  },
];

export default function DesktopNavBarWrapper() {
  // Render the NavBar, passing items defined locally
  // Apply classes needed for desktop layout (e.g., hiding on mobile)
  return (
    <div className="flex items-center justify-between w-full  ml-6">
      {/* EtherGuru Logo and Title/Link on the left */}
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-lg text-foreground hover:text-primary transition-colors"
      >
        <Image
          src="/ether-guru.png"
          alt="Ether Guru Logo"
          width={32} // Small size for navbar logo
          height={32}
          className="rounded-full" // Make it circular
        />
        <span>EtherGuru</span> {/* Keep text inside a span for potential styling */}
      </Link>

      {/* Middle flexible div to center the NavBar */}
      <div className="ml-40 flex-1 flex justify-between">
        <NavBar items={navItems} className="hidden md:flex" />
      </div>

      {/* Auth Buttons on the right */}
      <div className="flex items-center space-x-2">
        <UserProfile />
      </div>
    </div>
  );
}
