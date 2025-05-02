"use client";

import Link from "next/link";
import { useState } from "react";
import { challenges } from "@/lib/challenges";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function Home() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  // Helper function to determine styles based on difficulty
  const getDifficultyStyles = (difficulty: string | undefined) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return {
          iconBg: "bg-slate-100 dark:bg-slate-800",
          iconText: "text-slate-500 dark:text-slate-400",
          cardBg:
            "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-950",
        };
      case "medium":
        return {
          iconBg: "bg-slate-200 dark:bg-slate-700",
          iconText: "text-slate-600 dark:text-slate-300",
          cardBg:
            "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-800",
        };
      case "hard":
        return {
          iconBg: "bg-slate-300 dark:bg-slate-600",
          iconText: "text-slate-700 dark:text-slate-200",
          cardBg:
            "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-400 dark:to-slate-600",
        };
      case "insane":
        return {
          iconBg: "bg-slate-400 dark:bg-slate-500",
          iconText: "text-slate-800 dark:text-slate-100",
          cardBg:
            "bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-300 dark:to-slate-500",
        };
      default:
        return {
          iconBg: "bg-slate-100 dark:bg-slate-800",
          iconText: "text-slate-500 dark:text-slate-400",
          cardBg:
            "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-950",
        };
    }
  };

  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center h-screen text-center px-4 overflow-hidden">
        {/* Background animation container */}
        <div className="absolute inset-0 z-10 dark:opacity-10 mb-20">
          <BackgroundPaths />
        </div>
      </section>
      {/* Challenges Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-8 sm:mb-12 text-center">
            Available Challenges
          </h2>

          {/* Difficulty Filter Toggle Group */}
          <div className="flex justify-center mb-8 sm:mb-12">
            <ToggleGroup
              type="single"
              variant="outline"
              value={selectedDifficulty}
              onValueChange={(value: string) => {
                // Ensure a value is always selected, default back to 'All' if empty
                setSelectedDifficulty(value || "All");
              }}
              className="flex flex-wrap justify-center gap-4"
            >
              {["All", "Easy", "Medium", "Hard", "Insane"].map((difficulty) => (
                <ToggleGroupItem
                  key={difficulty}
                  value={difficulty}
                  aria-label={`Toggle ${difficulty}`}
                >
                  {difficulty}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Grid for challenges - Filtered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {challenges
              .filter(
                (challenge) =>
                  selectedDifficulty === "All" ||
                  challenge.difficulty === selectedDifficulty
              )
              .map((challenge) => {
                const IconComponent = challenge.icon;
                const difficultyStyles = getDifficultyStyles(
                  challenge.difficulty
                );
                return (
                  <Link
                    key={challenge.slug}
                    href={`/challenges/${challenge.slug}`}
                    className={`block border rounded-lg p-4 hover:bg-accent hover:text-accent-foreground transition-all duration-300 text-left shadow-md hover:shadow-lg hover:-translate-y-1 ${difficultyStyles.cardBg}`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`rounded-full p-2 mr-3 flex-shrink-0 ${difficultyStyles.iconBg}`}
                      >
                        {IconComponent && (
                          <IconComponent
                            className={`h-5 w-5 ${difficultyStyles.iconText}`}
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium truncate">
                          {challenge.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {challenge.difficulty}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>
    </main>
  );
}
