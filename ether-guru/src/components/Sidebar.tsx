// src/components/Sidebar.tsx
"use client"; // Needed for using hooks like usePathname

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react"; // Import useState
import { challenges, Challenge } from "@/lib/challenges"; // Import the full challenges array
import { cn } from "@/lib/utils";

export default function Sidebar() {
  // Using the full challenges array directly
  const pathname = usePathname(); // Get current path to highlight active link
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  // Helper function for sidebar hover styles
  const getSidebarHoverStyle = (difficulty: string | undefined) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "hover:bg-slate-200 dark:hover:bg-slate-700"; // Slightly darker
      case "medium":
        return "hover:bg-slate-300 dark:hover:bg-slate-600"; // Darker
      case "hard":
        return "hover:bg-slate-400 dark:hover:bg-slate-500"; // Even darker
      case "insane":
        return "hover:bg-slate-500 dark:hover:bg-slate-400"; // Darkest / Inverted contrast for dark
      default:
        return "hover:bg-slate-200 dark:hover:bg-slate-700"; // Default to easy style
    }
  };

  // Filter challenges based on search term
  const filteredChallenges = challenges.filter((challenge) =>
    challenge.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 border-r border-gray-300 dark:border-gray-700 shrink-0 overflow-y-auto">
      <h2 className="font-semibold text-lg mb-4 ml-2 dark:text-gray-200">
        Challenges
      </h2>
      <div className="mt-4 mb-3">
        <input
          type="text"
          placeholder="Search challenges..."
          className="w-full px-4 py-1 border rounded-2xl border-gray-300 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <nav>
        <ul>
          {filteredChallenges.map((challenge) => {
            // Map over the full challenges array
            const IconComponent = challenge.icon;
            const hoverStyle = getSidebarHoverStyle(challenge.difficulty);
            const { slug, name } = challenge; // Destructure needed properties
            const href = `/challenges/${slug}`;
            const isActive = pathname === href;
            return (
              <li key={slug} className="mb-1">
                <Link
                  href={href}
                  className={`flex items-center px-3 py-2 rounded text-sm transition-colors duration-150 ${
                    // Use flex for icon alignment
                    isActive
                      ? "bg-primary/10 dark:bg-primary/20 font-medium text-primary dark:text-primary-foreground"
                      : `text-gray-700 dark:text-gray-300 ${hoverStyle}` // Apply hover style
                  }`}
                >
                  <div className="flex items-center">
                    {IconComponent && (
                      <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                    )}{" "}
                    <span className="truncate">{name}</span> {/* Wrap name */}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
